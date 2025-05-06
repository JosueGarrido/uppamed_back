// models/appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
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

module.exports = Appointment;
