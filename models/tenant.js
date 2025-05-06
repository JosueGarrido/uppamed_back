const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tenant = sequelize.define('Tenant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

module.exports = Tenant;
