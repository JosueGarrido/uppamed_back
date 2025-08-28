'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar valores por defecto a los campos de compatibilidad
    await queryInterface.changeColumn('medical_records', 'diagnosis', {
      type: Sequelize.TEXT,
      defaultValue: ''
    });
    
    await queryInterface.changeColumn('medical_records', 'treatment', {
      type: Sequelize.TEXT,
      defaultValue: ''
    });
    
    await queryInterface.changeColumn('medical_records', 'observations', {
      type: Sequelize.TEXT,
      defaultValue: ''
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios
    await queryInterface.changeColumn('medical_records', 'diagnosis', {
      type: Sequelize.TEXT,
      defaultValue: null
    });
    
    await queryInterface.changeColumn('medical_records', 'treatment', {
      type: Sequelize.TEXT,
      defaultValue: null
    });
    
    await queryInterface.changeColumn('medical_records', 'observations', {
      type: Sequelize.TEXT,
      defaultValue: null
    });
  }
};
