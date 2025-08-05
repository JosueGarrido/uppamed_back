// models/medicalExam.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const MedicalExam = sequelize.define('MedicalExam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  specialist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Título descriptivo del examen',
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tipo de examen: sangre, rayos X, orina, etc.',
  },
  category: {
    type: DataTypes.ENUM('laboratorio', 'imagenologia', 'cardiologia', 'neurologia', 'gastroenterologia', 'otorrinolaringologia', 'oftalmologia', 'dermatologia', 'otros'),
    allowNull: false,
    defaultValue: 'otros',
    comment: 'Categoría del examen médico',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del examen',
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Resultados del examen (texto libre o JSON como string)',
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'completado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'Estado del examen',
  },
  priority: {
    type: DataTypes.ENUM('baja', 'normal', 'alta', 'urgente'),
    allowNull: false,
    defaultValue: 'normal',
    comment: 'Prioridad del examen',
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha programada para el examen',
  },
  performed_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha en que se realizó el examen',
  },
  report_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de entrega del reporte',
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Costo del examen',
  },
  insurance_coverage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Si el examen está cubierto por seguro',
  },
  insurance_provider: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Proveedor de seguro médico',
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Lista de rutas de archivos adjuntos',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del especialista',
  },
  is_abnormal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si los resultados son anormales',
  },
  requires_followup: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si requiere seguimiento',
  },
  followup_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de seguimiento recomendada',
  },
  lab_reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia del laboratorio o centro médico',
  },
  technician: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre del técnico que realizó el examen',
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación del registro',
  },
}, {
  tableName: 'medical_exams',
  timestamps: true,
  indexes: [
    {
      fields: ['patient_id']
    },
    {
      fields: ['specialist_id']
    },
    {
      fields: ['tenant_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['performed_date']
    }
  ]
});

// Asociaciones
MedicalExam.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
MedicalExam.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });

module.exports = MedicalExam;
