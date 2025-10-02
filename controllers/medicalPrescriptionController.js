const { MedicalPrescription, User, Tenant } = require('../models');
const { Op } = require('sequelize');

// Generar número de receta único
const generatePrescriptionNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `REC-${year}${month}${day}`;
  
  // Buscar la última receta del día
  const lastPrescription = await MedicalPrescription.findOne({
    where: {
      prescription_number: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['prescription_number', 'DESC']]
  });
  
  let sequence = 1;
  if (lastPrescription) {
    const lastSequence = parseInt(lastPrescription.prescription_number.split('-').pop());
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// Crear receta médica
const createMedicalPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenant_id;
    
    // Generar número de receta único
    const prescriptionNumber = await generatePrescriptionNumber();
    
    const prescriptionData = {
      ...req.body,
      specialist_id: userId,
      tenant_id: tenantId,
      prescription_number: prescriptionNumber
    };
    
    const prescription = await MedicalPrescription.create(prescriptionData);
    
    // Obtener la receta con relaciones
    const fullPrescription = await MedicalPrescription.findByPk(prescription.id, {
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
      message: 'Receta médica creada exitosamente',
      data: fullPrescription
    });
  } catch (error) {
    console.error('Error creating medical prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la receta médica',
      error: error.message
    });
  }
};

// Obtener recetas médicas del especialista
const getSpecialistPrescriptions = async (req, res) => {
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
        { prescription_number: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await MedicalPrescription.findAndCountAll({
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
        prescriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching specialist prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las recetas médicas',
      error: error.message
    });
  }
};

// Obtener receta médica por ID
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let whereClause = { id };
    
    // Solo el especialista que creó la receta o un admin/super admin pueden verla
    if (userRole === 'Especialista') {
      whereClause.specialist_id = userId;
    } else if (userRole === 'Paciente') {
      whereClause.patient_id = userId;
    }
    
    const prescription = await MedicalPrescription.findOne({
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
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta médica no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la receta médica',
      error: error.message
    });
  }
};

// Actualizar receta médica
const updateMedicalPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const prescription = await MedicalPrescription.findOne({
      where: {
        id,
        specialist_id: userId
      }
    });
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta médica no encontrada'
      });
    }
    
    await prescription.update(req.body);
    
    const updatedPrescription = await MedicalPrescription.findByPk(prescription.id, {
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
      message: 'Receta médica actualizada exitosamente',
      data: updatedPrescription
    });
  } catch (error) {
    console.error('Error updating medical prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la receta médica',
      error: error.message
    });
  }
};

// Anular receta médica
const voidMedicalPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const prescription = await MedicalPrescription.findOne({
      where: {
        id,
        specialist_id: userId
      }
    });
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta médica no encontrada'
      });
    }
    
    await prescription.update({ status: 'anulado' });
    
    res.json({
      success: true,
      message: 'Receta médica anulada exitosamente'
    });
  } catch (error) {
    console.error('Error voiding medical prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Error al anular la receta médica',
      error: error.message
    });
  }
};

// Obtener recetas del paciente
const getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await MedicalPrescription.findAndCountAll({
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
        prescriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las recetas médicas',
      error: error.message
    });
  }
};

module.exports = {
  createMedicalPrescription,
  getSpecialistPrescriptions,
  getPrescriptionById,
  updateMedicalPrescription,
  voidMedicalPrescription,
  getPatientPrescriptions
};
