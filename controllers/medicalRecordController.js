const MedicalRecord = require('../models/medicalRecord');
const User = require('../models/user');
const Appointment = require('../models/appointment');

// Crear un nuevo registro médico
const createMedicalRecord = async (req, res) => {
  const { patient_id, specialist_id, diagnosis, treatment, observations } = req.body;
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
      diagnosis,
      treatment,
      observations,
    });

    res.status(201).json({ message: 'Registro médico creado correctamente', medicalRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el registro médico', error: error.message });
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

module.exports = { 
  createMedicalRecord, 
  getMedicalRecordsForPatient, 
  getMedicalRecordsForSpecialist,
  getMedicalRecordById,
  updateMedicalRecord
};
