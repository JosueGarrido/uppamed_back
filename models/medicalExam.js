// models/medicalExam.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MedicalExam = sequelize.define('MedicalExam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  specialist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tipo de examen: sangre, rayos X, orina, etc.',
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Resultados del examen (texto libre o JSON como string)',
  },
  attachments: {
    type: DataTypes.JSON, // Guarda una lista de rutas de archivos
    allowNull: true,
  },  
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'medical_exams',
  timestamps: true,
});

module.exports = MedicalExam;
