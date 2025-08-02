'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla SpecialistSchedules
    await queryInterface.createTable('SpecialistSchedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 6
        }
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear tabla SpecialistBreaks
    await queryInterface.createTable('SpecialistBreaks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 6
        }
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Descanso'
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear índices para mejorar el rendimiento
    await queryInterface.addIndex('SpecialistSchedules', ['specialist_id', 'day_of_week']);
    await queryInterface.addIndex('SpecialistSchedules', ['tenant_id']);
    await queryInterface.addIndex('SpecialistBreaks', ['specialist_id', 'day_of_week']);
    await queryInterface.addIndex('SpecialistBreaks', ['tenant_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices
    await queryInterface.removeIndex('SpecialistSchedules', ['specialist_id', 'day_of_week']);
    await queryInterface.removeIndex('SpecialistSchedules', ['tenant_id']);
    await queryInterface.removeIndex('SpecialistBreaks', ['specialist_id', 'day_of_week']);
    await queryInterface.removeIndex('SpecialistBreaks', ['tenant_id']);

    // Eliminar tablas
    await queryInterface.dropTable('SpecialistBreaks');
    await queryInterface.dropTable('SpecialistSchedules');
  }
}; 