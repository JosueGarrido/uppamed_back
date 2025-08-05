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
  let schedules = req.body; // Recibe el body completo

  console.log('=== UPDATE SPECIALIST SCHEDULE ===');
  console.log('specialistId:', specialistId);
  console.log('tenantId:', tenantId);
  console.log('req.body received:', JSON.stringify(req.body, null, 2));

  // Manejar tanto formato de objeto como array directo
  if (req.body && req.body.schedules) {
    schedules = req.body.schedules;
    console.log('Extracted schedules from object:', JSON.stringify(schedules, null, 2));
  } else {
    schedules = req.body;
    console.log('Using direct schedules array:', JSON.stringify(schedules, null, 2));
  }

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

    console.log('Specialist found:', specialist.username);

    // Eliminar horarios existentes
    const deletedCount = await SpecialistSchedule.destroy({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId
      }
    });

    console.log('Deleted existing schedules:', deletedCount);

    // Crear nuevos horarios
    if (schedules && schedules.length > 0) {
      const schedulesToCreate = schedules.map(schedule => ({
        ...schedule,
        specialist_id: specialistId,
        tenant_id: tenantId
      }));

      console.log('Schedules to create:', JSON.stringify(schedulesToCreate, null, 2));

      const createdSchedules = await SpecialistSchedule.bulkCreate(schedulesToCreate);
      console.log('Created schedules count:', createdSchedules.length);
    } else {
      console.log('No schedules to create');
    }

    res.status(200).json({ message: 'Horarios actualizados correctamente' });
  } catch (error) {
    console.error('Error in updateSpecialistSchedule:', error);
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

  console.log('=== GET AVAILABLE SLOTS ===');
  console.log('specialistId:', specialistId);
  console.log('tenantId:', tenantId);
  console.log('date:', date);

  try {
    if (!date) {
      return res.status(400).json({ message: 'Fecha es requerida' });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    console.log('appointmentDate:', appointmentDate);
    console.log('dayOfWeek:', dayOfWeek);

    // Obtener horario del especialista para ese día
    const schedule = await SpecialistSchedule.findOne({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        day_of_week: dayOfWeek,
        is_available: true
      }
    });

    console.log('schedule found:', schedule);

    if (!schedule) {
      console.log('No schedule found for day:', dayOfWeek);
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

    console.log('breaks found:', breaks.length);

    // Obtener citas existentes para ese día
    const existingAppointments = await Appointment.findAll({
      where: {
        specialist_id: specialistId,
        tenant_id: tenantId,
        date: appointmentDate,
        status: { [require('sequelize').Op.notIn]: ['cancelada'] }
      }
    });

    console.log('existing appointments found:', existingAppointments.length);

    // Generar slots disponibles (cada 30 minutos)
    const availableSlots = [];
    const startTime = new Date(`2000-01-01T${schedule.start_time}`);
    const endTime = new Date(`2000-01-01T${schedule.end_time}`);
    
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    
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

    console.log('availableSlots generated:', availableSlots);
    res.status(200).json({ availableSlots });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({ message: 'Error al obtener slots disponibles' });
  }
};

module.exports = {
  getSpecialistSchedule,
  updateSpecialistSchedule,
  checkSpecialistAvailability,
  getAvailableSlots
}; 