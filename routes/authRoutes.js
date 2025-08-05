const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const { getSuperAdminSummary, getTenantsActivity } = require('../controllers/dashboardController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { impersonateTenantAdmin, restoreImpersonation } = require('../controllers/authController');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos',
        receivedData: { email: !!email, password: !!password }
      });
    }

    console.log('Intentando login con email:', email); // Log para debugging

    // Buscar usuario por email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!user) {
      console.log('Usuario no encontrado para el email:', email); // Log para debugging
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Contraseña inválida para el usuario:', email); // Log para debugging
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar respuesta sin la contraseña
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    console.log('Login exitoso para:', email); // Log para debugging

    res.json({ 
      token,
      user: userWithoutPassword,
      message: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get authenticated user data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Resumen dashboard Super Admin
router.get('/dashboard/super-admin/summary', authenticate, checkRole('Super Admin'), getSuperAdminSummary);

// Actividad por tenant para dashboard Super Admin
router.get('/dashboard/super-admin/tenants-activity', authenticate, checkRole('Super Admin'), getTenantsActivity);

// Impersonar admin de un tenant
router.post('/impersonate/:tenantId', authenticate, checkRole('Super Admin'), impersonateTenantAdmin);

// Restaurar sesión original del Super Admin
router.post('/restore-impersonation', authenticate, restoreImpersonation);

// Cambiar contraseña
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva contraseña son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    await user.update({ password: hashedNewPassword });

    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
});

// Actualizar perfil propio
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, area, specialty } = req.body;

    // Validaciones
    if (!username || !email) {
      return res.status(400).json({ message: 'Nombre de usuario y email son requeridos' });
    }

    // Obtener usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el email no esté en uso por otro usuario
    if (email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
    }

    // Verificar que el username no esté en uso por otro usuario
    if (username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      }
    }

    // Validar que especialistas tengan área y especialidad
    if (user.role === 'Especialista') {
      if (!area || !specialty) {
        return res.status(400).json({ 
          message: 'Los campos área y especialidad son obligatorios para especialistas' 
        });
      }
    }

    // Actualizar perfil
    const updateData = { username, email };
    if (user.role === 'Especialista') {
      updateData.area = area;
      updateData.specialty = specialty;
    }

    await user.update(updateData);

    // Devolver usuario actualizado sin contraseña
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    res.json({ 
      message: 'Perfil actualizado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
});

module.exports = router;
