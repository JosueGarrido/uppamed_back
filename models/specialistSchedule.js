// models/specialistSchedule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const SpecialistSchedule = sequelize.define('SpecialistSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  specialist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  day_of_week: {
    type: DataTypes.INTEGER, // 0=Sunday, 1=Monday, 2=Tuesday, etc.
    allowNull: false,
    validate: {
      min: 0,
      max: 6
    }
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// Asociación con el especialista
SpecialistSchedule.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });

module.exports = SpecialistSchedule; 