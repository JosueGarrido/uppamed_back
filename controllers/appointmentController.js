const Appointment = require('../models/appointment');
const User = require('../models/user');

// Crear una nueva cita
const createAppointment = async (req, res) => {
  const { date, specialist_id, patient_id: bodyPatientId, reason, status, notes } = req.body;

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

    // Validar que el paciente existe y pertenece al mismo tenant
    const patient = await User.findOne({
      where: {
        id: patient_id,
        tenant_id: tenant_id,
        role: 'Paciente',
      },
    });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente no encontrado o no válido para este tenant' });
    }

    const appointment = await Appointment.create({
      date,
      specialist_id,
      patient_id,
      tenant_id,
      reason,
      status: status || 'pendiente',
      notes,
    });

    res.status(201).json({ message: 'Cita agendada correctamente', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agendar la cita', error: error.message });
  }
};

// Obtener las citas del usuario (paciente o especialista)
const getAppointmentsForUser = async (req, res) => {
  console.log('🩺 getAppointmentsForUser - req.user:', req.user);
  const userId = req.user.id;
  const tenantId = req.user.tenant_id;

  try {
    let appointments;
    if (req.user.role === 'Paciente') {
      appointments = await Appointment.findAll({
        where: { patient_id: userId, tenant_id: tenantId },
        include: [
          { model: User, as: 'appointmentSpecialist', attributes: ['id', 'username', 'email', 'specialty'] },
          { model: User, as: 'appointmentPatient', attributes: ['id', 'username', 'email', 'identification_number'] }
        ]
      });
    } else if (req.user.role === 'Especialista') {
      appointments = await Appointment.findAll({
        where: { specialist_id: userId, tenant_id: tenantId },
        include: [
          { model: User, as: 'appointmentSpecialist', attributes: ['id', 'username', 'email', 'specialty'] },
          { model: User, as: 'appointmentPatient', attributes: ['id', 'username', 'email', 'identification_number'] }
        ]
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
  const userId = req.user.id;

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

// Obtener todas las citas de un tenant (solo admin o super admin)
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
      order: [['date', 'DESC']],
      include: [
        { model: User, as: 'appointmentSpecialist', attributes: ['id', 'username', 'email', 'specialty'] },
        { model: User, as: 'appointmentPatient', attributes: ['id', 'username', 'email', 'identification_number'] }
      ]
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las citas del tenant' });
  }
};

// Obtener una cita por ID
const getAppointmentById = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'appointmentSpecialist', attributes: ['id', 'username', 'email', 'specialty'] },
        { model: User, as: 'appointmentPatient', attributes: ['id', 'username', 'email', 'identification_number'] }
      ]
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la cita' });
  }
};

// Actualizar una cita por ID
const updateAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { date, specialist_id, patient_id, notes, status, reason } = req.body;
  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    // Permitir solo a admin, super admin, o dueño modificar
    if (!['Administrador', 'Super Admin'].includes(req.user.role) && req.user.id !== appointment.patient_id && req.user.id !== appointment.specialist_id) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    if (date) appointment.date = date;
    if (specialist_id) appointment.specialist_id = specialist_id;
    if (patient_id) appointment.patient_id = patient_id;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;
    if (reason !== undefined) appointment.reason = reason;
    await appointment.save();
    res.status(200).json({ message: 'Cita actualizada', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la cita' });
  }
};

// Eliminar una cita por ID
const deleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    // Permitir solo a admin, super admin, o dueño eliminar
    if (!['Administrador', 'Super Admin'].includes(req.user.role) && req.user.id !== appointment.patient_id && req.user.id !== appointment.specialist_id) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    await appointment.destroy();
    res.status(200).json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la cita' });
  }
};

module.exports = {
  createAppointment,
  getAppointmentsForUser,
  updateAppointmentNotes,
  getAppointmentsForTenant,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
