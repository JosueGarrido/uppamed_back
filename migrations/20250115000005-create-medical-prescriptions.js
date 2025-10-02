'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_prescriptions', {
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
      prescription_number: {
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
      patient_cedula: {
        type: Sequelize.STRING,
        allowNull: true
      },
      patient_city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Medicamentos prescritos (JSON)
      medications: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      // Diagnóstico
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cie_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Antecedentes de alergias
      allergy_history: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Instrucciones de uso (JSON)
      instructions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      // Próxima cita
      next_appointment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_appointment_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      // Recomendaciones no farmacológicas
      non_pharmacological_recommendations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Información del médico
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
    await queryInterface.addIndex('medical_prescriptions', ['patient_id']);
    await queryInterface.addIndex('medical_prescriptions', ['specialist_id']);
    await queryInterface.addIndex('medical_prescriptions', ['tenant_id']);
    await queryInterface.addIndex('medical_prescriptions', ['prescription_number']);
    await queryInterface.addIndex('medical_prescriptions', ['issue_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medical_prescriptions');
  }
};
