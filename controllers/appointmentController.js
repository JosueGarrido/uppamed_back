const Appointment = require('../models/appointment');
const User = require('../models/user');

// Crear una nueva cita
const createAppointment = async (req, res) => {
  const { date, specialist_id } = req.body;

  // Validar que el usuario logueado tiene la información correcta
  const patient_id = req.user?.userId;
  const tenant_id = req.user?.tenant_id;

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

module.exports = {
  createAppointment,
  getAppointmentsForUser,
  updateAppointmentNotes,
};
