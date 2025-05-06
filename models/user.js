module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Administrador', 'Especialista', 'Paciente'),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    identification_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true, // solo aplica si es Especialista
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: true, // solo aplica si es Especialista
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'users',
    timestamps: true,
  });

  return User;
};
