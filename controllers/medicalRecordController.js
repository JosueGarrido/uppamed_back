const MedicalRecord = require('../models/medicalRecord');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const { Op } = require('sequelize');

// Crear una nueva historia clínica
const createMedicalRecord = async (req, res) => {
  const { 
    patient_id, 
    specialist_id, 
    clinical_history_number,
    consultation_reason_a,
    consultation_reason_b,
    consultation_reason_c,
    consultation_reason_d,
    family_history,
    clinical_history,
    surgical_history,
    gynecological_history,
    habits,
    current_illness,
    systems_review,
    blood_pressure,
    oxygen_saturation,
    heart_rate,
    respiratory_rate,
    temperature,
    weight,
    height,
    head_circumference,
    physical_examination,
    diagnoses,
    treatment_plans,
    evolution_entries,
    consultation_date,
    consultation_time,
    status,
    // Campos de compatibilidad
    diagnosis,
    treatment,
    observations
  } = req.body;
  
  const tenant_id = req.user.tenant_id;

  // Verificar si el especialista es válido y pertenece al mismo tenant
  const specialist = await User.findByPk(specialist_id);
  if (!specialist || specialist.role !== 'Especialista' || specialist.tenant_id !== tenant_id) {
    return res.status(404).json({ message: 'Especialista no encontrado o no autorizado' });
  }

  // Verificar si el paciente existe y pertenece al mismo tenant
  const patient = await User.findByPk(patient_id);
  if (!patient || patient.tenant_id !== tenant_id) {
    return res.status(404).json({ message: 'Paciente no encontrado o no autorizado' });
  }

  // Verificar que el especialista haya atendido previamente al paciente
  const appointment = await Appointment.findOne({
    where: {
      patient_id,
      specialist_id,
      tenant_id,
    },
  });
  if (!appointment) {
    return res.status(400).json({ message: 'El especialista no ha atendido a este paciente' });
  }

  try {
    const medicalRecord = await MedicalRecord.create({
      patient_id,
      specialist_id,
      tenant_id,
      clinical_history_number: clinical_history_number || `HCL-${Date.now()}`,
      consultation_reason_a,
      consultation_reason_b,
      consultation_reason_c,
      consultation_reason_d,
      family_history,
      clinical_history,
      surgical_history,
      gynecological_history,
      habits,
      current_illness,
      systems_review: systems_review || {
        sense_organs: 'SP',
        respiratory: 'SP',
        cardiovascular: 'SP',
        digestive: 'SP',
        genital: 'SP',
        urinary: 'SP',
        musculoskeletal: 'SP',
        endocrine: 'SP',
        hemolymphatic: 'SP',
        nervous: 'SP'
      },
      blood_pressure,
      oxygen_saturation,
      heart_rate,
      respiratory_rate,
      temperature,
      weight,
      height,
      head_circumference,
      physical_examination: physical_examination || {
        skin_appendages: 'SP',
        head: 'SP',
        eyes: 'SP',
        ears: 'SP',
        nose: 'SP',
        mouth: 'SP',
        oropharynx: 'SP',
        neck: 'SP',
        axillae_breasts: 'SP',
        thorax: 'SP',
        abdomen: 'SP',
        vertebral_column: 'SP',
        groin_perineum: 'SP',
        upper_limbs: 'SP',
        lower_limbs: 'SP'
      },
      diagnoses: diagnoses || [],
      treatment_plans,
      evolution_entries: evolution_entries || [],
      consultation_date: consultation_date || new Date(),
      consultation_time: consultation_time || new Date(),
      status: status || 'borrador',
      // Campos de compatibilidad
      diagnosis,
      treatment,
      observations
    });

    res.status(201).json({ 
      message: 'Historia clínica creada correctamente', 
      medicalRecord 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Error al crear la historia clínica', 
      error: error.message 
    });
  }
};

// Obtener los registros médicos de un paciente (solo el paciente o el especialista que lo atendió)
const getMedicalRecordsForPatient = async (req, res) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecords = await MedicalRecord.findAll({
      where: { patient_id: userId, tenant_id: tenantId },
    });

    res.status(200).json(medicalRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los registros médicos' });
  }
};

// Obtener los registros médicos de un especialista (solo los creados por el especialista)
const getMedicalRecordsForSpecialist = async (req, res) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecords = await MedicalRecord.findAll({
      where: { specialist_id: userId, tenant_id: tenantId },
    });

    res.status(200).json(medicalRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los registros médicos' });
  }
};

// Obtener un registro médico por ID
const getMedicalRecordById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    // Verificar que el usuario tenga acceso al registro
    if (req.user.role === 'Paciente') {
      // Pacientes solo pueden ver sus propios registros
      if (medicalRecord.patient_id !== userId) {
        return res.status(403).json({ message: 'No tienes permisos para ver este registro' });
      }
    } else if (req.user.role === 'Especialista') {
      // Especialistas solo pueden ver registros que crearon o de su tenant
      if (medicalRecord.specialist_id !== userId && medicalRecord.tenant_id !== tenantId) {
        return res.status(403).json({ message: 'No tienes permisos para ver este registro' });
      }
    }

    res.status(200).json(medicalRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el registro médico' });
  }
};

// Actualizar un registro médico
const updateMedicalRecord = async (req, res) => {
  const { id } = req.params;
  const { patient_id, diagnosis, treatment, observations } = req.body;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    // Verificar que el especialista sea el creador del registro
    if (medicalRecord.specialist_id !== userId) {
      return res.status(403).json({ message: 'Solo puedes editar registros que hayas creado' });
    }

    // Verificar que el registro pertenezca al mismo tenant
    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para editar este registro' });
    }

    // Verificar si el paciente existe y pertenece al mismo tenant
    if (patient_id) {
      const patient = await User.findByPk(patient_id);
      if (!patient || patient.tenant_id !== tenantId) {
        return res.status(404).json({ message: 'Paciente no encontrado o no autorizado' });
      }
    }

    // Actualizar el registro
    await medicalRecord.update({
      patient_id: patient_id || medicalRecord.patient_id,
      diagnosis,
      treatment,
      observations,
    });

    res.status(200).json({ 
      message: 'Registro médico actualizado correctamente', 
      medicalRecord: await medicalRecord.reload() 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el registro médico' });
  }
};

// Eliminar un registro médico
const deleteMedicalRecord = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Registro médico no encontrado' });
    }

    // Verificar que el especialista sea el creador del registro
    if (medicalRecord.specialist_id !== userId) {
      return res.status(403).json({ message: 'Solo puedes eliminar registros que hayas creado' });
    }

    // Verificar que el registro pertenezca al mismo tenant
    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este registro' });
    }

    // Eliminar el registro
    await medicalRecord.destroy();

    res.status(200).json({ message: 'Registro médico eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el registro médico' });
  }
};

// Obtener todos los registros médicos para administradores (todos los registros del tenant)
const getMedicalRecordsForAdmin = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { 
    page = 1, 
    limit = 10, 
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = req.query;

  try {
    const offset = (page - 1) * limit;
    const whereClause = { tenant_id: tenantId };

    // Filtro por fecha
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    // Búsqueda por texto
    if (search) {
      whereClause[Op.or] = [
        { diagnosis: { [Op.like]: `%${search}%` } },
        { treatment: { [Op.like]: `%${search}%` } },
        { observations: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: medicalRecords } = await MedicalRecord.findAndCountAll({
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
      medicalRecords,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching medical records for admin:', error);
    res.status(500).json({ 
      message: 'Error al obtener los registros médicos',
      error: error.message 
    });
  }
};

// Agregar diagnóstico a una historia clínica
const addDiagnosis = async (req, res) => {
  const { id } = req.params;
  const { diagnosis, type, cie_code } = req.body; // type: 'presuntivo' o 'definitivo'
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }

    // Verificar permisos
    if (medicalRecord.specialist_id !== userId && req.user.role !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta historia clínica' });
    }

    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a esta historia clínica' });
    }

    const newDiagnosis = {
      id: Date.now(),
      diagnosis,
      type,
      cie_code,
      date: new Date(),
      specialist_id: userId
    };

    const currentDiagnoses = medicalRecord.diagnoses || [];
    currentDiagnoses.push(newDiagnosis);

    await medicalRecord.update({ diagnoses: currentDiagnoses });

    res.status(200).json({ 
      message: 'Diagnóstico agregado correctamente', 
      diagnosis: newDiagnosis 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar el diagnóstico' });
  }
};

// Agregar entrada de evolución a una historia clínica
const addEvolutionEntry = async (req, res) => {
  const { id } = req.params;
  const { evolution_note, prescription, prescription_code } = req.body;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }

    // Verificar permisos
    if (medicalRecord.specialist_id !== userId && req.user.role !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta historia clínica' });
    }

    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a esta historia clínica' });
    }

    const newEntry = {
      id: Date.now(),
      evolution_note,
      prescription,
      prescription_code,
      date: new Date(),
      time: new Date(),
      specialist_id: userId,
      specialist_name: req.user.username
    };

    const currentEntries = medicalRecord.evolution_entries || [];
    currentEntries.push(newEntry);

    await medicalRecord.update({ evolution_entries: currentEntries });

    res.status(200).json({ 
      message: 'Entrada de evolución agregada correctamente', 
      entry: newEntry 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar la entrada de evolución' });
  }
};

// Actualizar estado de revisión de sistemas
const updateSystemsReview = async (req, res) => {
  const { id } = req.params;
  const { systems_review } = req.body;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }

    // Verificar permisos
    if (medicalRecord.specialist_id !== userId && req.user.role !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta historia clínica' });
    }

    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a esta historia clínica' });
    }

    await medicalRecord.update({ systems_review });

    res.status(200).json({ 
      message: 'Revisión de sistemas actualizada correctamente', 
      systems_review 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la revisión de sistemas' });
  }
};

// Actualizar estado de examen físico
const updatePhysicalExamination = async (req, res) => {
  const { id } = req.params;
  const { physical_examination } = req.body;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }

    // Verificar permisos
    if (medicalRecord.specialist_id !== userId && req.user.role !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta historia clínica' });
    }

    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a esta historia clínica' });
    }

    await medicalRecord.update({ physical_examination });

    res.status(200).json({ 
      message: 'Examen físico actualizado correctamente', 
      physical_examination 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el examen físico' });
  }
};

// Cambiar estado de la historia clínica
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    const medicalRecord = await MedicalRecord.findByPk(id);
    
    if (!medicalRecord) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }

    // Verificar permisos
    if (medicalRecord.specialist_id !== userId && req.user.role !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta historia clínica' });
    }

    if (medicalRecord.tenant_id !== tenantId) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a esta historia clínica' });
    }

    await medicalRecord.update({ status });

    res.status(200).json({ 
      message: 'Estado de la historia clínica actualizado correctamente', 
      status 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el estado' });
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecordsForPatient,
  getMedicalRecordsForSpecialist,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsForAdmin,
  addDiagnosis,
  addEvolutionEntry,
  updateSystemsReview,
  updatePhysicalExamination,
  updateStatus
};
