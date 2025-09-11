const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalCertificate = sequelize.define('MedicalCertificate', {
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
    certificate_number: {
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
    patient_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    patient_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    patient_institution: {
      type: DataTypes.STRING,
      allowNull: true
    },
    patient_occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    patient_cedula: {
      type: DataTypes.STRING,
      allowNull: true
    },
    patient_clinical_history: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Motivos de la enfermedad
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cie_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contingency_type: {
      type: DataTypes.ENUM('Enfermedad general', 'Accidente de trabajo', 'Enfermedad profesional', 'Accidente común'),
      allowNull: false,
      defaultValue: 'Enfermedad general'
    },
    rest_hours: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rest_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rest_from_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    rest_to_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    // Firma de responsabilidad
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
    tableName: 'medical_certificates',
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
        fields: ['certificate_number']
      },
      {
        fields: ['issue_date']
      }
    ]
  });

  MedicalCertificate.associate = (models) => {
    MedicalCertificate.belongsTo(models.User, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    MedicalCertificate.belongsTo(models.User, {
      foreignKey: 'specialist_id',
      as: 'specialist'
    });
    MedicalCertificate.belongsTo(models.Tenant, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });
  };

  return MedicalCertificate;
};
