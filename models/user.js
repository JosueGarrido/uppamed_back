// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Administrador', 'Especialista', 'Paciente'), allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  identification_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  area: { type: DataTypes.STRING },
  specialty: { type: DataTypes.STRING },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
