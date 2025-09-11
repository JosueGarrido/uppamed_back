const { MedicalCertificate, User, Tenant } = require('../models');
const { Op } = require('sequelize');

// Generar número de certificado único
const generateCertificateNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `CERT-${year}${month}${day}`;
  
  // Buscar el último certificado del día
  const lastCertificate = await MedicalCertificate.findOne({
    where: {
      certificate_number: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['certificate_number', 'DESC']]
  });
  
  let sequence = 1;
  if (lastCertificate) {
    const lastSequence = parseInt(lastCertificate.certificate_number.split('-').pop());
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Crear certificado médico
const createMedicalCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenant_id;
    
    // Generar número de certificado único
    const certificateNumber = await generateCertificateNumber();
    
    const certificateData = {
      ...req.body,
      specialist_id: userId,
      tenant_id: tenantId,
      certificate_number: certificateNumber
    };
    
    const certificate = await MedicalCertificate.create(certificateData);
    
    // Obtener el certificado con relaciones
    const fullCertificate = await MedicalCertificate.findByPk(certificate.id, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'username', 'email', 'cedula', 'phone']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'username', 'email', 'cedula', 'speciality']
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'name', 'address', 'phone', 'ruc']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Certificado médico creado exitosamente',
      data: fullCertificate
    });
  } catch (error) {
    console.error('Error creating medical certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el certificado médico',
      error: error.message
    });
  }
};

// Obtener certificados médicos del especialista
const getSpecialistCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereClause = {
      specialist_id: userId
    };
    
    if (search) {
      whereClause[Op.or] = [
        { patient_name: { [Op.like]: `%${search}%` } },
        { diagnosis: { [Op.like]: `%${search}%` } },
        { certificate_number: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await MedicalCertificate.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'username', 'email', 'cedula', 'phone']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'username', 'email', 'cedula', 'speciality']
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'name', 'address', 'phone', 'ruc']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        certificates: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching specialist certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los certificados médicos',
      error: error.message
    });
  }
};

// Obtener certificado médico por ID
const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let whereClause = { id };
    
    // Solo el especialista que creó el certificado o un admin/super admin pueden verlo
    if (userRole === 'Especialista') {
      whereClause.specialist_id = userId;
    } else if (userRole === 'Paciente') {
      whereClause.patient_id = userId;
    }
    
    const certificate = await MedicalCertificate.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'username', 'email', 'cedula', 'phone']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'username', 'email', 'cedula', 'speciality']
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'name', 'address', 'phone', 'ruc']
        }
      ]
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado médico no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el certificado médico',
      error: error.message
    });
  }
};

// Actualizar certificado médico
const updateMedicalCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const certificate = await MedicalCertificate.findOne({
      where: {
        id,
        specialist_id: userId
      }
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado médico no encontrado'
      });
    }
    
    await certificate.update(req.body);
    
    const updatedCertificate = await MedicalCertificate.findByPk(certificate.id, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'username', 'email', 'cedula', 'phone']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'username', 'email', 'cedula', 'speciality']
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'name', 'address', 'phone', 'ruc']
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Certificado médico actualizado exitosamente',
      data: updatedCertificate
    });
  } catch (error) {
    console.error('Error updating medical certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el certificado médico',
      error: error.message
    });
  }
};

// Anular certificado médico
const voidMedicalCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const certificate = await MedicalCertificate.findOne({
      where: {
        id,
        specialist_id: userId
      }
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado médico no encontrado'
      });
    }
    
    await certificate.update({ status: 'anulado' });
    
    res.json({
      success: true,
      message: 'Certificado médico anulado exitosamente'
    });
  } catch (error) {
    console.error('Error voiding medical certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error al anular el certificado médico',
      error: error.message
    });
  }
};

// Obtener certificados del paciente
const getPatientCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await MedicalCertificate.findAndCountAll({
      where: {
        patient_id: userId,
        status: 'activo'
      },
      include: [
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'username', 'email', 'cedula', 'speciality']
        },
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'name', 'address', 'phone', 'ruc']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        certificates: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching patient certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los certificados médicos',
      error: error.message
    });
  }
};

module.exports = {
  createMedicalCertificate,
  getSpecialistCertificates,
  getCertificateById,
  updateMedicalCertificate,
  voidMedicalCertificate,
  getPatientCertificates
};
