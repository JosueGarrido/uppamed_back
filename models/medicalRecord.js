// models/medicalRecord.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user'); // ¡Aquí ahora es un Sequelize.Model real!

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patient_id: { type: DataTypes.INTEGER, allowNull: false },
  specialist_id: { type: DataTypes.INTEGER, allowNull: false },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  diagnosis: { type: DataTypes.TEXT, allowNull: false },
  treatment: { type: DataTypes.TEXT, allowNull: false },
  observations: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'medical_records',
  timestamps: true,
});

// Asociaciones usando el modelo ya instanciado
MedicalRecord.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });

module.exports = MedicalRecord;
