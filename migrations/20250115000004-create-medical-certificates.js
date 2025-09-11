'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_certificates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      specialist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      certificate_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // Datos del paciente
      patient_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      patient_age: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      patient_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      patient_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      patient_institution: {
        type: Sequelize.STRING,
        allowNull: true
      },
      patient_occupation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      patient_cedula: {
        type: Sequelize.STRING,
        allowNull: true
      },
      patient_clinical_history: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Motivos de la enfermedad
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cie_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contingency_type: {
        type: Sequelize.ENUM('Enfermedad general', 'Accidente de trabajo', 'Enfermedad profesional', 'Accidente común'),
        allowNull: false,
        defaultValue: 'Enfermedad general'
      },
      rest_hours: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rest_days: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rest_from_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      rest_to_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      // Firma de responsabilidad
      doctor_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctor_cedula: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctor_specialty: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctor_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Información del establecimiento
      establishment_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      establishment_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      establishment_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      establishment_ruc: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Metadatos
      issue_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('activo', 'anulado'),
        allowNull: false,
        defaultValue: 'activo'
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Agregar índices
    await queryInterface.addIndex('medical_certificates', ['patient_id']);
    await queryInterface.addIndex('medical_certificates', ['specialist_id']);
    await queryInterface.addIndex('medical_certificates', ['tenant_id']);
    await queryInterface.addIndex('medical_certificates', ['certificate_number']);
    await queryInterface.addIndex('medical_certificates', ['issue_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medical_certificates');
  }
};
