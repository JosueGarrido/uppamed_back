const User = require('../models/user');
const Tenant = require('../models/tenant');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { tenantId } = req.params;
  const { username, password, role, area, specialty } = req.body;

  try {
    // Verificar si el tenant existe
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    // Validación estricta si la ruta es /pacientes => solo permitir crear usuarios con rol 'Paciente'
    const isPacienteRoute = req.path.includes('/pacientes');
    if (isPacienteRoute && role !== 'Paciente') {
      return res.status(400).json({ message: 'Solo se pueden crear pacientes en esta ruta' });
    }

    // Si no es Super Admin, no puede crear Administradores
    if (role === 'Administrador' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Solo el Super Admin puede crear Administradores' });
    }

    // Un paciente no puede crear usuarios
    if (req.user.role === 'Paciente') {
      return res.status(403).json({ message: 'Un Paciente no puede crear usuarios' });
    }

    // Validar el rol
    if (!['Administrador', 'Especialista', 'Paciente'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Validar que Especialistas tengan área y especialidad
    if (role === 'Especialista') {
      if (!area || !specialty) {
        return res.status(400).json({
          message: 'Los campos "area" y "specialty" son obligatorios para Especialistas.',
        });
      }
    }

    // Verificar si el username ya existe
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      tenant_id: tenant.id,
      area: role === 'Especialista' ? area : null,
      specialty: role === 'Especialista' ? specialty : null,
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        area: user.area,
        specialty: user.specialty,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

// Listar usuarios de un tenant
const listUsersByTenant = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const users = await User.findAll({
      where: { tenant_id: tenantId },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los usuarios del tenant' });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, area, specialty } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Solo Super Admin puede cambiar rol a Administrador
    if (role === 'Administrador' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Solo el Super Admin puede asignar el rol Administrador' });
    }
    await user.update({ username, email, role, area, specialty });
    res.status(200).json({ message: 'Usuario actualizado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    await user.destroy();
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};

module.exports = { registerUser, listUsersByTenant, getUserById, updateUser, deleteUser };
