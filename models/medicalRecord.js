// models/medicalRecord.js - Historia Clínica Completa
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Datos del Paciente
  patient_id: { type: DataTypes.INTEGER, allowNull: false },
  specialist_id: { type: DataTypes.INTEGER, allowNull: false },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  
  // Información General
  establishment: { type: DataTypes.STRING, allowNull: false, defaultValue: 'CEMO SAN FRANCISCO' },
  clinical_history_number: { type: DataTypes.STRING, allowNull: false },
  
  // Motivo de Consulta
  consultation_reason_a: { type: DataTypes.TEXT },
  consultation_reason_b: { type: DataTypes.TEXT },
  consultation_reason_c: { type: DataTypes.TEXT },
  consultation_reason_d: { type: DataTypes.TEXT },
  
  // Antecedentes
  family_history: { type: DataTypes.TEXT },
  clinical_history: { type: DataTypes.TEXT },
  surgical_history: { type: DataTypes.TEXT },
  gynecological_history: { type: DataTypes.TEXT },
  habits: { type: DataTypes.TEXT },
  
  // Enfermedad Actual
  current_illness: { type: DataTypes.TEXT },
  
  // Revisión de Sistemas (JSON para almacenar estado CP/SP)
  systems_review: { 
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: {
      sense_organs: 'SP',
      respiratory: 'SP',
      cardiovascular: 'SP',
      digestive: 'SP',
      genital: 'SP',
      urinary: 'SP',
      musculoskeletal: 'SP',
      endocrine: 'SP',
      hemolymphatic: 'SP',
      nervous: 'SP'
    }
  },
  
  // Signos Vitales
  blood_pressure: { type: DataTypes.STRING },
  oxygen_saturation: { type: DataTypes.STRING },
  heart_rate: { type: DataTypes.STRING },
  respiratory_rate: { type: DataTypes.STRING },
  temperature: { type: DataTypes.STRING },
  weight: { type: DataTypes.STRING },
  height: { type: DataTypes.STRING },
  head_circumference: { type: DataTypes.STRING },
  
  // Examen Físico (JSON para almacenar estado CP/SP)
  physical_examination: { 
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: {
      skin_appendages: 'SP',
      head: 'SP',
      eyes: 'SP',
      ears: 'SP',
      nose: 'SP',
      mouth: 'SP',
      oropharynx: 'SP',
      neck: 'SP',
      axillae_breasts: 'SP',
      thorax: 'SP',
      abdomen: 'SP',
      vertebral_column: 'SP',
      groin_perineum: 'SP',
      upper_limbs: 'SP',
      lower_limbs: 'SP'
    }
  },
  
  // Diagnósticos (JSON para múltiples diagnósticos)
  diagnoses: { 
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: []
  },
  
  // Planes de Tratamiento
  treatment_plans: { type: DataTypes.TEXT },
  
  // Evolución y Prescripciones (JSON para múltiples entradas)
  evolution_entries: { 
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue: []
  },
  
  // Fecha y Hora de la Consulta
  consultation_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  consultation_time: { type: DataTypes.TIME, defaultValue: DataTypes.NOW },
  
  // Estado del Registro
  status: { 
    type: DataTypes.ENUM('borrador', 'completado', 'archivado'), 
    defaultValue: 'borrador' 
  },
  
  // Campos adicionales para compatibilidad
  diagnosis: { type: DataTypes.TEXT, defaultValue: '' }, // Mantener para compatibilidad
  treatment: { type: DataTypes.TEXT, defaultValue: '' }, // Mantener para compatibilidad
  observations: { type: DataTypes.TEXT, defaultValue: '' }, // Mantener para compatibilidad
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // Mantener para compatibilidad
  
}, {
  tableName: 'medical_records',
  timestamps: true,
});

// Asociaciones
MedicalRecord.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });

module.exports = MedicalRecord;
