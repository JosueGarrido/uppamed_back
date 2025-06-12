'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

      // up
    await queryInterface.addColumn('Appointments', 'reason', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('Appointments', 'status', { 
      type: Sequelize.ENUM('pendiente', 'confirmada', 'completada', 'cancelada'), 
      allowNull: false, 
      defaultValue: 'pendiente' 
    });

  
  },

  async down (queryInterface, Sequelize) {
    // down
    await queryInterface.removeColumn('Appointments', 'reason');
    await queryInterface.removeColumn('Appointments', 'status');
  }
};
