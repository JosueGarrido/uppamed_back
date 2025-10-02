const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalPrescription = sequelize.define('MedicalPrescription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    prescription_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Datos del paciente
    patient_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    patient_age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    patient_cedula: {
      type: DataTypes.STRING,
      allowNull: true
    },
    patient_city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Medicamentos prescritos (JSON)
    medications: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    // Diagnóstico
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cie_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Antecedentes de alergias
    allergy_history: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Instrucciones de uso (JSON)
    instructions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    // Próxima cita
    next_appointment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    next_appointment_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    // Recomendaciones no farmacológicas
    non_pharmacological_recommendations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Información del médico
    doctor_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctor_cedula: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctor_specialty: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctor_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Información del establecimiento
    establishment_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    establishment_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    establishment_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    establishment_ruc: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Metadatos
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('activo', 'anulado'),
      allowNull: false,
      defaultValue: 'activo'
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'medical_prescriptions',
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
        fields: ['prescription_number']
      },
      {
        fields: ['issue_date']
      }
    ]
  });

  MedicalPrescription.associate = (models) => {
    MedicalPrescription.belongsTo(models.User, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    MedicalPrescription.belongsTo(models.User, {
      foreignKey: 'specialist_id',
      as: 'specialist'
    });
    MedicalPrescription.belongsTo(models.Tenant, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });
  };

  return MedicalPrescription;
};
