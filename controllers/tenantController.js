const Tenant = require('../models/tenant');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Utilidad para generar un CI aleatorio de 10 dígitos
const generarIdentificacion = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Crear un nuevo tenant (hospital)
const createTenant = async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: 'Nombre y dirección son requeridos' });
  }

  try {
    const existingTenant = await Tenant.findOne({ where: { name } });

    if (existingTenant) {
      return res.status(409).json({ message: 'Ya existe un tenant con ese nombre' });
    }

    const tenant = await Tenant.create({ name, address });

    // Crear el usuario administrador
    const adminUsername = `admin_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const tempPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const adminUser = await User.create({
      username: adminUsername,
      email: `${adminUsername}@admin.com`,
      password: hashedPassword,
      role: 'Administrador',
      identification_number: generarIdentificacion(),
      area: 'Administración',
      specialty: 'Gestión',
      tenant_id: tenant.id,
    });

    res.status(201).json({
      tenant,
      admin: {
        username: adminUser.username,
        email: adminUser.email,
        password: tempPassword, // ⚠️ en producción no deberías devolver esto
        role: adminUser.role,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el tenant o su administrador' });
  }
};

const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los tenants' });
  }
};

// Obtener un tenant por ID
const getTenantById = async (req, res) => {
  const { id } = req.params;

  try {
    const tenant = await Tenant.findByPk(id);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    res.status(200).json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el tenant' });
  }
};

// Actualizar un tenant
const updateTenant = async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  if (!name && !address) {
    return res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar' });
  }

  try {
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    // Si se está actualizando el nombre, verificar que no exista otro tenant con ese nombre
    if (name && name !== tenant.name) {
      const existingTenant = await Tenant.findOne({ where: { name } });
      if (existingTenant) {
        return res.status(409).json({ message: 'Ya existe un tenant con ese nombre' });
      }
    }

    await tenant.update({ name, address });

    res.status(200).json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el tenant' });
  }
};

// Eliminar un tenant
const deleteTenant = async (req, res) => {
  const { id } = req.params;

  try {
    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    // Verificar si hay usuarios asociados al tenant
    const usersCount = await User.count({ where: { tenant_id: id } });
    
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el tenant porque tiene usuarios asociados. Elimine primero los usuarios.' 
      });
    }

    await tenant.destroy();

    res.status(200).json({ message: 'Tenant eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el tenant' });
  }
};

module.exports = { createTenant, getTenants, getTenantById, updateTenant, deleteTenant };
