// models/appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'completada', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  specialist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// Asociaciones para incluir datos de usuario en las citas
Appointment.belongsTo(User, { as: 'specialist', foreignKey: 'specialist_id' });
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });

module.exports = Appointment;
