'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar nuevas columnas para historia clínica
    await queryInterface.addColumn('medical_records', 'establishment', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'CEMO SAN FRANCISCO'
    });

    await queryInterface.addColumn('medical_records', 'clinical_history_number', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Motivo de Consulta
    await queryInterface.addColumn('medical_records', 'consultation_reason_a', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'consultation_reason_b', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'consultation_reason_c', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'consultation_reason_d', {
      type: Sequelize.TEXT
    });

    // Antecedentes
    await queryInterface.addColumn('medical_records', 'family_history', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'clinical_history', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'surgical_history', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'gynecological_history', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('medical_records', 'habits', {
      type: Sequelize.TEXT
    });

    // Enfermedad Actual
    await queryInterface.addColumn('medical_records', 'current_illness', {
      type: Sequelize.TEXT
    });

    // Revisión de Sistemas
    await queryInterface.addColumn('medical_records', 'systems_review', {
      type: Sequelize.JSON,
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
    });

    // Signos Vitales
    await queryInterface.addColumn('medical_records', 'blood_pressure', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'oxygen_saturation', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'heart_rate', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'respiratory_rate', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'temperature', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'weight', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'height', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('medical_records', 'head_circumference', {
      type: Sequelize.STRING
    });

    // Examen Físico
    await queryInterface.addColumn('medical_records', 'physical_examination', {
      type: Sequelize.JSON,
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
    });

    // Diagnósticos
    await queryInterface.addColumn('medical_records', 'diagnoses', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });

    // Planes de Tratamiento
    await queryInterface.addColumn('medical_records', 'treatment_plans', {
      type: Sequelize.TEXT
    });

    // Evolución y Prescripciones
    await queryInterface.addColumn('medical_records', 'evolution_entries', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });

    // Fecha y Hora de Consulta
    await queryInterface.addColumn('medical_records', 'consultation_date', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.addColumn('medical_records', 'consultation_time', {
      type: Sequelize.TIME,
      defaultValue: Sequelize.NOW
    });

    // Estado del Registro
    await queryInterface.addColumn('medical_records', 'status', {
      type: Sequelize.ENUM('borrador', 'completado', 'archivado'),
      defaultValue: 'borrador'
    });

    // Crear índices para mejorar el rendimiento
    await queryInterface.addIndex('medical_records', ['patient_id']);
    await queryInterface.addIndex('medical_records', ['specialist_id']);
    await queryInterface.addIndex('medical_records', ['tenant_id']);
    await queryInterface.addIndex('medical_records', ['clinical_history_number']);
    await queryInterface.addIndex('medical_records', ['consultation_date']);
    await queryInterface.addIndex('medical_records', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex('medical_records', ['patient_id']);
    await queryInterface.removeIndex('medical_records', ['specialist_id']);
    await queryInterface.removeIndex('medical_records', ['tenant_id']);
    await queryInterface.removeIndex('medical_records', ['clinical_history_number']);
    await queryInterface.removeIndex('medical_records', ['consultation_date']);
    await queryInterface.removeIndex('medical_records', ['status']);

    // Remover columnas agregadas
    const columnsToRemove = [
      'establishment',
      'clinical_history_number',
      'consultation_reason_a',
      'consultation_reason_b',
      'consultation_reason_c',
      'consultation_reason_d',
      'family_history',
      'clinical_history',
      'surgical_history',
      'gynecological_history',
      'habits',
      'current_illness',
      'systems_review',
      'blood_pressure',
      'oxygen_saturation',
      'heart_rate',
      'respiratory_rate',
      'temperature',
      'weight',
      'height',
      'head_circumference',
      'physical_examination',
      'diagnoses',
      'treatment_plans',
      'evolution_entries',
      'consultation_date',
      'consultation_time',
      'status'
    ];

    for (const column of columnsToRemove) {
      await queryInterface.removeColumn('medical_records', column);
    }
  }
};
