const User = require('../models/user');
const SpecialistSchedule = require('../models/specialistSchedule');
const SpecialistBreak = require('../models/specialistBreak');
const Appointment = require('../models/appointment');

// Obtener horarios de un especialista
const getSpecialistSchedule = async (req, res) => {
  const { specialistId } = req.params;
  const { tenantId } = req.params;

  try {
    // Verificar que el especialista existe y pertenece al tenant
    const specialist = await User.findOne({
      where: {
        id: specialistId,
        tenant_id: tenantId,
        role: 'Especialista'
      }
    });

    if (!specialist) {
      return res.status(404).json({ message: 'Especialista no encontrado' });
    }

    // Obtener horarios del especialista
    const schedules = await SpecialistSchedule.findAll({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId
      },
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });

    // Obtener breaks del especialista
    const breaks = await SpecialistBreak.findAll({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId
      },
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });

    res.status(200).json({
      specialist: {
        id: specialist.id,
        username: specialist.username,
        email: specialist.email,
        specialty: specialist.specialty
      },
      schedules,
      breaks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener horarios del especialista' });
  }
};

// Crear/actualizar horario de especialista
const updateSpecialistSchedule = async (req, res) => {
  const { specialistId } = req.params;
  const { tenantId } = req.params;
  const { schedules } = req.body;

  try {
    // Verificar permisos (solo admin o super admin)
    if (!['Administrador', 'Super Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Verificar que el especialista existe
    const specialist = await User.findOne({
      where: {
        id: specialistId,
        tenant_id: tenantId,
        role: 'Especialista'
      }
    });

    if (!specialist) {
      return res.status(404).json({ message: 'Especialista no encontrado' });
    }

    // Eliminar horarios existentes
    await SpecialistSchedule.destroy({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId
      }
    });

    // Crear nuevos horarios
    if (schedules && schedules.length > 0) {
      await SpecialistSchedule.bulkCreate(
        schedules.map(schedule => ({
          ...schedule,
          specialist_id: specialistId,
          tenant_id: tenantId
        }))
      );
    }

    res.status(200).json({ message: 'Horarios actualizados correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar horarios' });
  }
};

// Verificar disponibilidad de un especialista en una fecha/hora específica
const checkSpecialistAvailability = async (req, res) => {
  const { specialistId } = req.params;
  const { tenantId } = req.params;
  const { date, time } = req.query;

  try {
    if (!date || !time) {
      return res.status(400).json({ message: 'Fecha y hora son requeridas' });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const appointmentTime = time;

    // Verificar si el especialista trabaja ese día
    const schedule = await SpecialistSchedule.findOne({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        day_of_week: dayOfWeek,
        is_available: true
      }
    });

    if (!schedule) {
      return res.status(200).json({ 
        available: false, 
        reason: 'El especialista no trabaja este día' 
      });
    }

    // Verificar si la hora está dentro del horario de trabajo
    if (appointmentTime < schedule.start_time || appointmentTime > schedule.end_time) {
      return res.status(200).json({ 
        available: false, 
        reason: 'Fuera del horario de trabajo' 
      });
    }

    // Verificar si hay un break en esa hora
    const breakTime = await SpecialistBreak.findOne({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        day_of_week: dayOfWeek,
        start_time: { [require('sequelize').Op.lte]: appointmentTime },
        end_time: { [require('sequelize').Op.gte]: appointmentTime }
      }
    });

    if (breakTime) {
      return res.status(200).json({ 
        available: false, 
        reason: 'El especialista tiene un descanso en esta hora' 
      });
    }

    // Verificar si ya hay una cita en esa fecha/hora
    const existingAppointment = await Appointment.findOne({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        date: appointmentDate,
        status: { [require('sequelize').Op.notIn]: ['cancelada'] }
      }
    });

    if (existingAppointment) {
      return res.status(200).json({ 
        available: false, 
        reason: 'Ya hay una cita programada en esta fecha/hora' 
      });
    }

    res.status(200).json({ available: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar disponibilidad' });
  }
};

// Obtener horarios disponibles de un especialista para una fecha
const getAvailableSlots = async (req, res) => {
  const { specialistId } = req.params;
  const { tenantId } = req.params;
  const { date } = req.query;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Fecha es requerida' });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    // Obtener horario del especialista para ese día
    const schedule = await SpecialistSchedule.findOne({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        day_of_week: dayOfWeek,
        is_available: true
      }
    });

    if (!schedule) {
      return res.status(200).json({ availableSlots: [] });
    }

    // Obtener breaks del especialista para ese día
    const breaks = await SpecialistBreak.findAll({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        day_of_week: dayOfWeek
      }
    });

    // Obtener citas existentes para ese día
    const existingAppointments = await Appointment.findAll({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        date: appointmentDate,
        status: { [require('sequelize').Op.notIn]: ['cancelada'] }
      }
    });

    // Generar slots disponibles (cada 30 minutos)
    const availableSlots = [];
    const startTime = new Date(`2000-01-01T${schedule.start_time}`);
    const endTime = new Date(`2000-01-01T${schedule.end_time}`);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Verificar si no hay break en esta hora
      const hasBreak = breaks.some(breakItem => {
        const breakStart = new Date(`2000-01-01T${breakItem.start_time}`);
        const breakEnd = new Date(`2000-01-01T${breakItem.end_time}`);
        return currentTime >= breakStart && currentTime < breakEnd;
      });

      // Verificar si no hay cita en esta hora
      const hasAppointment = existingAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.date);
        return appointmentTime.getHours() === currentTime.getHours() && 
               appointmentTime.getMinutes() === currentTime.getMinutes();
      });

      if (!hasBreak && !hasAppointment) {
        availableSlots.push(timeString);
      }

      // Avanzar 30 minutos
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener slots disponibles' });
  }
};

module.exports = {
  getSpecialistSchedule,
  updateSpecialistSchedule,
  checkSpecialistAvailability,
  getAvailableSlots
}; 