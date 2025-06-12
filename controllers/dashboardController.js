const Tenant = require('../models/tenant');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const { Op } = require('sequelize');

// KPIs y actividad reciente para el dashboard del Super Admin
const getSuperAdminSummary = async (req, res) => {
  try {
    // KPIs
    const totalTenants = await Tenant.count();
    const totalUsers = await User.count();
    const totalEspecialistas = await User.count({ where: { role: 'Especialista' } });
    const totalPacientes = await User.count({ where: { role: 'Paciente' } });
    const totalCitas = await Appointment.count();

    // Citas por estado (asumiendo que hay un campo status, si no, solo total)
    // const citasProximas = await Appointment.count({ where: { date: { [Op.gte]: new Date() } } });
    // const citasFinalizadas = ...

    // Últimos registros
    const ultimosTenants = await Tenant.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    const ultimosUsuarios = await User.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    const ultimasCitas = await Appointment.findAll({ order: [['createdAt', 'DESC']], limit: 5 });

    res.json({
      kpis: {
        totalTenants,
        totalUsers,
        totalEspecialistas,
        totalPacientes,
        totalCitas,
      },
      ultimosTenants,
      ultimosUsuarios,
      ultimasCitas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el resumen del dashboard' });
  }
};

module.exports = { getSuperAdminSummary }; 