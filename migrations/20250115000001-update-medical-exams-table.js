'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('medical_exams', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Examen Médico',
      after: 'tenant_id'
    });

    await queryInterface.addColumn('medical_exams', 'category', {
      type: Sequelize.ENUM('laboratorio', 'imagenologia', 'cardiologia', 'neurologia', 'gastroenterologia', 'otorrinolaringologia', 'oftalmologia', 'dermatologia', 'otros'),
      allowNull: false,
      defaultValue: 'otros',
      after: 'type'
    });

    await queryInterface.addColumn('medical_exams', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'category'
    });

    await queryInterface.addColumn('medical_exams', 'status', {
      type: Sequelize.ENUM('pendiente', 'en_proceso', 'completado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendiente',
      after: 'results'
    });

    await queryInterface.addColumn('medical_exams', 'priority', {
      type: Sequelize.ENUM('baja', 'normal', 'alta', 'urgente'),
      allowNull: false,
      defaultValue: 'normal',
      after: 'status'
    });

    await queryInterface.addColumn('medical_exams', 'scheduled_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'priority'
    });

    await queryInterface.addColumn('medical_exams', 'performed_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'scheduled_date'
    });

    await queryInterface.addColumn('medical_exams', 'report_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'performed_date'
    });

    await queryInterface.addColumn('medical_exams', 'cost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      after: 'report_date'
    });

    await queryInterface.addColumn('medical_exams', 'insurance_coverage', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'cost'
    });

    await queryInterface.addColumn('medical_exams', 'insurance_provider', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'insurance_coverage'
    });

    await queryInterface.addColumn('medical_exams', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'attachments'
    });

    await queryInterface.addColumn('medical_exams', 'is_abnormal', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'notes'
    });

    await queryInterface.addColumn('medical_exams', 'requires_followup', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'is_abnormal'
    });

    await queryInterface.addColumn('medical_exams', 'followup_date', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'requires_followup'
    });

    await queryInterface.addColumn('medical_exams', 'lab_reference', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'followup_date'
    });

    await queryInterface.addColumn('medical_exams', 'technician', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'lab_reference'
    });

    // Crear índices para mejorar el rendimiento
    await queryInterface.addIndex('medical_exams', ['patient_id']);
    await queryInterface.addIndex('medical_exams', ['specialist_id']);
    await queryInterface.addIndex('medical_exams', ['tenant_id']);
    await queryInterface.addIndex('medical_exams', ['status']);
    await queryInterface.addIndex('medical_exams', ['type']);
    await queryInterface.addIndex('medical_exams', ['category']);
    await queryInterface.addIndex('medical_exams', ['scheduled_date']);
    await queryInterface.addIndex('medical_exams', ['performed_date']);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices
    await queryInterface.removeIndex('medical_exams', ['patient_id']);
    await queryInterface.removeIndex('medical_exams', ['specialist_id']);
    await queryInterface.removeIndex('medical_exams', ['tenant_id']);
    await queryInterface.removeIndex('medical_exams', ['status']);
    await queryInterface.removeIndex('medical_exams', ['type']);
    await queryInterface.removeIndex('medical_exams', ['category']);
    await queryInterface.removeIndex('medical_exams', ['scheduled_date']);
    await queryInterface.removeIndex('medical_exams', ['performed_date']);

    // Eliminar columnas
    await queryInterface.removeColumn('medical_exams', 'technician');
    await queryInterface.removeColumn('medical_exams', 'lab_reference');
    await queryInterface.removeColumn('medical_exams', 'followup_date');
    await queryInterface.removeColumn('medical_exams', 'requires_followup');
    await queryInterface.removeColumn('medical_exams', 'is_abnormal');
    await queryInterface.removeColumn('medical_exams', 'notes');
    await queryInterface.removeColumn('medical_exams', 'insurance_provider');
    await queryInterface.removeColumn('medical_exams', 'insurance_coverage');
    await queryInterface.removeColumn('medical_exams', 'cost');
    await queryInterface.removeColumn('medical_exams', 'report_date');
    await queryInterface.removeColumn('medical_exams', 'performed_date');
    await queryInterface.removeColumn('medical_exams', 'scheduled_date');
    await queryInterface.removeColumn('medical_exams', 'priority');
    await queryInterface.removeColumn('medical_exams', 'status');
    await queryInterface.removeColumn('medical_exams', 'description');
    await queryInterface.removeColumn('medical_exams', 'category');
    await queryInterface.removeColumn('medical_exams', 'title');
  }
}; 