const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TenantConfig = sequelize.define('TenantConfig', {
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'tenant_configs',
  timestamps: true,
});

module.exports = TenantConfig; 