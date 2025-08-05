// controllers/medicalExamController.js
const MedicalExam = require('../models/medicalExam');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const { Op } = require('sequelize');

// Crear examen médico (solo Especialista)
const createMedicalExam = async (req, res) => {
  const {
    patient_id,
    title,
    type,
    category,
    description,
    results,
    status = 'pendiente',
    priority = 'normal',
    scheduled_date,
    performed_date,
    report_date,
    cost,
    insurance_coverage = false,
    insurance_provider,
    notes,
    is_abnormal = false,
    requires_followup = false,
    followup_date,
    lab_reference,
    technician
  } = req.body;
  
  const specialist_id = req.user.id;
  const tenant_id = req.user.tenant_id;

  try {
    // Verificar que el paciente existe y pertenece al mismo tenant
    const patient = await User.findByPk(patient_id);
    if (!patient || patient.tenant_id !== tenant_id) {
      return res.status(404).json({ message: 'Paciente no encontrado o no autorizado' });
    }

    // Verificar que el especialista haya atendido previamente al paciente
    const appointment = await Appointment.findOne({
      where: { patient_id, specialist_id, tenant_id },
    });
    if (!appointment) {
      return res.status(403).json({ message: 'El especialista no ha atendido a este paciente' });
    }

    // Procesar archivos adjuntos
    const attachments = req.files?.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    })) || [];

    const medicalExam = await MedicalExam.create({
      patient_id,
      specialist_id,
      tenant_id,
      title,
      type,
      category,
      description,
      results,
      status,
      priority,
      scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
      performed_date: performed_date ? new Date(performed_date) : null,
      report_date: report_date ? new Date(report_date) : null,
      cost: cost ? parseFloat(cost) : null,
      insurance_coverage,
      insurance_provider,
      attachments,
      notes,
      is_abnormal,
      requires_followup,
      followup_date: followup_date ? new Date(followup_date) : null,
      lab_reference,
      technician
    });

    // Cargar relaciones para la respuesta
    await medicalExam.reload({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'username', 'email', 'identification_number'] },
        { model: User, as: 'specialist', attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(201).json({ 
      message: 'Examen médico creado correctamente', 
      medicalExam 
    });
  } catch (error) {
    console.error('Error creating medical exam:', error);
    res.status(500).json({ 
      message: 'Error al crear el examen médico', 
      error: error.message 
    });
  }
};

// Obtener exámenes médicos del usuario (paciente o especialista)
const getMedicalExamsForUser = async (req, res) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;
  const { 
    page = 1, 
    limit = 10, 
    status, 
    category, 
    type, 
    priority,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'DESC'
  } = req.query;

  try {
    const offset = (page - 1) * limit;
    const whereClause = { tenant_id: tenantId };

    // Filtrar por rol
    if (req.user.role === 'Paciente') {
      whereClause.patient_id = userId;
    } else if (req.user.role === 'Especialista') {
      whereClause.specialist_id = userId;
    } else {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Aplicar filtros adicionales
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;
    if (priority) whereClause.priority = priority;

    // Filtro por fecha
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }

    // Búsqueda por texto
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { results: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: exams } = await MedicalExam.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'username', 'email', 'identification_number'] },
        { model: User, as: 'specialist', attributes: ['id', 'username', 'email'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      exams,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching medical exams:', error);
    res.status(500).json({ 
      message: 'Error al obtener los exámenes médicos',
      error: error.message 
    });
  }
};

// Obtener un examen médico por ID
const getMedicalExamById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const whereClause = { id, tenant_id: tenantId };

    // Filtrar por rol
    if (req.user.role === 'Paciente') {
      whereClause.patient_id = userId;
    } else if (req.user.role === 'Especialista') {
      whereClause.specialist_id = userId;
    }

    const medicalExam = await MedicalExam.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'username', 'email', 'identification_number'] },
        { model: User, as: 'specialist', attributes: ['id', 'username', 'email'] }
      ]
    });

    if (!medicalExam) {
      return res.status(404).json({ message: 'Examen médico no encontrado' });
    }

    res.status(200).json(medicalExam);
  } catch (error) {
    console.error('Error fetching medical exam:', error);
    res.status(500).json({ 
      message: 'Error al obtener el examen médico',
      error: error.message 
    });
  }
};

// Actualizar un examen médico
const updateMedicalExam = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;
  const updateData = req.body;

  try {
    const medicalExam = await MedicalExam.findOne({
      where: { id, specialist_id: userId, tenant_id: tenantId }
    });

    if (!medicalExam) {
      return res.status(404).json({ message: 'Examen médico no encontrado o no autorizado' });
    }

    // Procesar archivos adjuntos si se proporcionan
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      // Combinar con archivos existentes
      const existingAttachments = medicalExam.attachments || [];
      updateData.attachments = [...existingAttachments, ...newAttachments];
    }

    // Procesar fechas
    if (updateData.scheduled_date) updateData.scheduled_date = new Date(updateData.scheduled_date);
    if (updateData.performed_date) updateData.performed_date = new Date(updateData.performed_date);
    if (updateData.report_date) updateData.report_date = new Date(updateData.report_date);
    if (updateData.followup_date) updateData.followup_date = new Date(updateData.followup_date);

    // Procesar valores numéricos
    if (updateData.cost) updateData.cost = parseFloat(updateData.cost);

    await medicalExam.update(updateData);

    // Recargar con relaciones
    await medicalExam.reload({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'username', 'email', 'identification_number'] },
        { model: User, as: 'specialist', attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(200).json({ 
      message: 'Examen médico actualizado correctamente', 
      medicalExam 
    });
  } catch (error) {
    console.error('Error updating medical exam:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el examen médico',
      error: error.message 
    });
  }
};

// Eliminar un examen médico
const deleteMedicalExam = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalExam = await MedicalExam.findOne({
      where: { id, specialist_id: userId, tenant_id: tenantId }
    });
    
    if (!medicalExam) {
      return res.status(404).json({ message: 'Examen médico no encontrado o no autorizado' });
    }

    await medicalExam.destroy();

    res.status(200).json({ message: 'Examen médico eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting medical exam:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el examen médico',
      error: error.message 
    });
  }
};

// Obtener estadísticas de exámenes
const getExamStatistics = async (req, res) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;
  const { startDate, endDate } = req.query;

  try {
    const whereClause = { tenant_id: tenantId };

    // Filtrar por rol
    if (req.user.role === 'Paciente') {
      whereClause.patient_id = userId;
    } else if (req.user.role === 'Especialista') {
      whereClause.specialist_id = userId;
    }

    // Filtro por fecha
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = new Date(startDate);
      if (endDate) whereClause.date[Op.lte] = new Date(endDate);
    }

    const exams = await MedicalExam.findAll({ where: whereClause });

    const statistics = {
      total: exams.length,
      byStatus: {
        pendiente: exams.filter(e => e.status === 'pendiente').length,
        en_proceso: exams.filter(e => e.status === 'en_proceso').length,
        completado: exams.filter(e => e.status === 'completado').length,
        cancelado: exams.filter(e => e.status === 'cancelado').length
      },
      byCategory: {
        laboratorio: exams.filter(e => e.category === 'laboratorio').length,
        imagenologia: exams.filter(e => e.category === 'imagenologia').length,
        cardiologia: exams.filter(e => e.category === 'cardiologia').length,
        neurologia: exams.filter(e => e.category === 'neurologia').length,
        gastroenterologia: exams.filter(e => e.category === 'gastroenterologia').length,
        otorrinolaringologia: exams.filter(e => e.category === 'otorrinolaringologia').length,
        oftalmologia: exams.filter(e => e.category === 'oftalmologia').length,
        dermatologia: exams.filter(e => e.category === 'dermatologia').length,
        otros: exams.filter(e => e.category === 'otros').length
      },
      byPriority: {
        baja: exams.filter(e => e.priority === 'baja').length,
        normal: exams.filter(e => e.priority === 'normal').length,
        alta: exams.filter(e => e.priority === 'alta').length,
        urgente: exams.filter(e => e.priority === 'urgente').length
      },
      abnormal: exams.filter(e => e.is_abnormal).length,
      requiresFollowup: exams.filter(e => e.requires_followup).length,
      totalCost: exams.reduce((sum, e) => sum + (e.cost || 0), 0)
    };

    res.status(200).json(statistics);
  } catch (error) {
    console.error('Error fetching exam statistics:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

// Obtener exámenes que requieren seguimiento
const getExamsRequiringFollowup = async (req, res) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const whereClause = { 
      tenant_id: tenantId,
      requires_followup: true
    };

    // Filtrar por rol
    if (req.user.role === 'Paciente') {
      whereClause.patient_id = userId;
    } else if (req.user.role === 'Especialista') {
      whereClause.specialist_id = userId;
    }

    const exams = await MedicalExam.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'username', 'email', 'identification_number'] },
        { model: User, as: 'specialist', attributes: ['id', 'username', 'email'] }
      ],
      order: [['followup_date', 'ASC']]
    });

    res.status(200).json(exams);
  } catch (error) {
    console.error('Error fetching followup exams:', error);
    res.status(500).json({ 
      message: 'Error al obtener exámenes con seguimiento',
      error: error.message 
    });
  }
};

module.exports = {
  createMedicalExam,
  getMedicalExamsForUser,
  getMedicalExamById,
  updateMedicalExam,
  deleteMedicalExam,
  getExamStatistics,
  getExamsRequiringFollowup
};
