'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true, // <-- cambia a true
      unique: true,
    });
    
    await queryInterface.addColumn('users', 'identification_number', {
      type: Sequelize.STRING,
      allowNull: true, // <-- cambia a true
      unique: true,
    });
  },    

    

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'email');
    await queryInterface.removeColumn('users', 'identification_number');
    
  }
};
