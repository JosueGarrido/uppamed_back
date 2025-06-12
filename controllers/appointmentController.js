const Appointment = require('../models/appointment');
const User = require('../models/user');

// Crear una nueva cita
const createAppointment = async (req, res) => {
  const { date, specialist_id, patient_id: bodyPatientId } = req.body;

  let patient_id;
  const tenant_id = req.user?.tenant_id;

  if (req.user.role === 'Paciente') {
    patient_id = req.user?.userId;
  } else if (['Administrador', 'Super Admin'].includes(req.user.role)) {
    patient_id = bodyPatientId;
  }

  // Verificar que el paciente y el tenant no sean nulos
  if (!patient_id || !tenant_id) {
    return res.status(400).json({ message: 'Datos del paciente o tenant no disponibles' });
  }

  try {
    // Validar que el especialista existe, pertenece al mismo tenant y tiene el rol correcto
    const specialist = await User.findOne({
      where: {
        id: specialist_id,
        tenant_id: tenant_id,
        role: 'Especialista',
      },
    });

    if (!specialist) {
      return res.status(404).json({ message: 'Especialista no encontrado o no válido para este tenant' });
    }

    const appointment = await Appointment.create({
      date,
      specialist_id,
      patient_id,
      tenant_id,
    });

    res.status(201).json({ message: 'Cita agendada correctamente', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agendar la cita', error: error.message });
  }
};

// Obtener las citas del usuario (paciente o especialista)
const getAppointmentsForUser = async (req, res) => {
  const userId = req.user.userId;
  const tenantId = req.user.tenant_id;

  try {
    let appointments;
    if (req.user.role === 'Paciente') {
      appointments = await Appointment.findAll({
        where: { patient_id: userId, tenant_id: tenantId },
      });
    } else if (req.user.role === 'Especialista') {
      appointments = await Appointment.findAll({
        where: { specialist_id: userId, tenant_id: tenantId },
      });
    } else {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las citas' });
  }
};

// Modificar las notas de una cita (solo especialista)
const updateAppointmentNotes = async (req, res) => {
  const { appointmentId } = req.params;
  const { notes } = req.body;
  const userId = req.user.userId;

  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    if (appointment.specialist_id !== userId) {
      return res.status(403).json({ message: 'Solo el especialista puede modificar esta cita' });
    }

    appointment.notes = notes;
    await appointment.save();

    res.status(200).json({ message: 'Notas de la cita actualizadas', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar las notas de la cita' });
  }
};

// Obtener todas las citas de un tenant (solo para Administrador o Super Admin)
const getAppointmentsForTenant = async (req, res) => {
  const { tenantId } = req.params;
  try {
    if (!tenantId) {
      return res.status(400).json({ message: 'Falta tenantId' });
    }
    if (!['Administrador', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const appointments = await Appointment.findAll({
      where: { tenant_id: tenantId },
      order: [['date', 'DESC']]
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las citas del tenant' });
  }
};

module.exports = {
  createAppointment,
  getAppointmentsForUser,
  updateAppointmentNotes,
  getAppointmentsForTenant,
};
