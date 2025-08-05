const Tenant = require('../models/tenant');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const TenantConfig = require('../models/tenantConfig');

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

    // Eliminar todos los usuarios asociados al tenant excepto los Super Admin
    await User.destroy({ where: { tenant_id: id, role: { [require('sequelize').Op.ne]: 'Super Admin' } } });

    // Eliminar el tenant
    await tenant.destroy();

    res.status(200).json({ message: 'Tenant y usuarios asociados eliminados exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el tenant y sus usuarios asociados' });
  }
};

// Obtener configuración de un tenant
const getTenantConfig = async (req, res) => {
  const { id } = req.params;
  try {
    const configs = await TenantConfig.findAll({ where: { tenant_id: id } });
    res.json(configs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la configuración del tenant' });
  }
};

// Actualizar configuración de un tenant (recibe un array de {key, value})
const updateTenantConfig = async (req, res) => {
  const { id } = req.params;
  const { configs } = req.body; // [{key, value}]
  try {
    // Borra la config anterior y crea la nueva (simple y robusto)
    await TenantConfig.destroy({ where: { tenant_id: id } });
    const created = await TenantConfig.bulkCreate(configs.map(cfg => ({ ...cfg, tenant_id: id })));
    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la configuración del tenant' });
  }
};

// Obtener el tenant del usuario autenticado (para Administradores)
const getMyTenant = async (req, res) => {
  const tenantId = req.user.tenant_id;
  
  try {
    const tenant = await Tenant.findByPk(tenantId);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant no encontrado' });
    }

    res.status(200).json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el tenant' });
  }
};

// Actualizar el tenant del usuario autenticado (para Administradores)
const updateMyTenant = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { name, address } = req.body;

  if (!name && !address) {
    return res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar' });
  }

  try {
    const tenant = await Tenant.findByPk(tenantId);

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

// Obtener configuración del tenant del usuario autenticado (para Administradores)
const getMyTenantConfig = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const configs = await TenantConfig.findAll({ where: { tenant_id: tenantId } });
    res.json(configs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la configuración del tenant' });
  }
};

// Actualizar configuración del tenant del usuario autenticado (para Administradores)
const updateMyTenantConfig = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { configs } = req.body; // [{key, value}]
  try {
    // Borra la config anterior y crea la nueva (simple y robusto)
    await TenantConfig.destroy({ where: { tenant_id: tenantId } });
    const created = await TenantConfig.bulkCreate(configs.map(cfg => ({ ...cfg, tenant_id: tenantId })));
    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la configuración del tenant' });
  }
};

module.exports = { 
  createTenant, 
  getTenants, 
  getTenantById, 
  updateTenant, 
  deleteTenant, 
  getTenantConfig, 
  updateTenantConfig,
  getMyTenant,
  updateMyTenant,
  getMyTenantConfig,
  updateMyTenantConfig
};
