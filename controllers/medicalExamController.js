// controllers/medicalExamController.js
const MedicalExam = require('../models/medicalExam');
const User = require('../models/user');
const Appointment = require('../models/appointment');

// Crear examen médico (solo Especialista)
const createMedicalExam = async (req, res) => {
  const { patient_id, type, result } = req.body;
  const specialist_id = req.user.id;
  const tenant_id = req.user.tenant_id;

  const patient = await User.findByPk(patient_id);
  if (!patient || patient.tenant_id !== tenant_id) {
    return res.status(404).json({ message: 'Paciente no encontrado o no autorizado' });
  }

  const appointment = await Appointment.findOne({
    where: { patient_id, specialist_id, tenant_id },
  });
  if (!appointment) {
    return res.status(403).json({ message: 'El especialista no ha atendido a este paciente' });
  }

  try {
    const attachments = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const medicalExam = await MedicalExam.create({
      patient_id,
      specialist_id,
      tenant_id,
      type,
      results: result, // Mapear 'result' del frontend a 'results' del modelo
      attachments,
    });

    res.status(201).json({ message: 'Examen médico creado correctamente', medicalExam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el examen médico', error: error.message });
  }
};


// Obtener exámenes médicos del usuario (paciente o especialista)
const getMedicalExamsForUser = async (req, res) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    let exams;
    if (req.user.role === 'Paciente') {
      exams = await MedicalExam.findAll({
        where: { patient_id: userId, tenant_id: tenantId },
      });
    } else if (req.user.role === 'Especialista') {
      exams = await MedicalExam.findAll({
        where: { specialist_id: userId, tenant_id: tenantId },
      });
    } else {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.status(200).json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los exámenes médicos' });
  }
};

module.exports = {
  createMedicalExam,
  getMedicalExamsForUser,
};
