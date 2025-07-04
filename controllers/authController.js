// controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para el login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar al usuario por username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña ingresada con la almacenada encriptada
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar un JWT si la contraseña es correcta
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, tenant_id: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

const getCookies = (req) => {
  if (req.cookies) return req.cookies;
  const cookieHeader = req.headers.cookie;
  let cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      cookies[name] = decodeURIComponent(rest.join('='));
    });
  }
  return cookies;
};

// Impersonar: Super Admin obtiene un token como admin de un tenant
const impersonateTenantAdmin = async (req, res) => {
  const { tenantId } = req.params;
  try {
    // Busca el admin principal del tenant
    const admin = await User.findOne({ where: { tenant_id: tenantId, role: 'Administrador' } });
    if (!admin) {
      return res.status(404).json({ message: 'No se encontró un administrador para este tenant' });
    }
    // Genera un token JWT como si fueras ese admin
    const adminToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenant_id: admin.tenant_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Obtener cookies de forma robusta
    const cookies = getCookies(req);
    // Guardar la cookie original_token SOLO si el usuario autenticado es Super Admin
    if (req.user && req.user.role === 'Super Admin' && req.headers.authorization) {
      const originalToken = req.headers.authorization.replace('Bearer ', '');
      res.cookie('original_token', originalToken, {
        httpOnly: true,
        sameSite: 'none', // Necesario para cross-domain
        secure: true,     // Necesario para https
        maxAge: 2 * 60 * 60 * 1000 // 2 horas
      });
    }

    res.json({ token: adminToken, user: { id: admin.id, email: admin.email, role: admin.role, tenant_id: admin.tenant_id } });
  } catch (error) {
    console.error('Error en impersonateTenantAdmin:', error);
    res.status(500).json({ message: 'Error al impersonar al admin del tenant', error: error.message, stack: error.stack });
  }
};

// Endpoint para restaurar la sesión original del Super Admin
const restoreImpersonation = (req, res) => {
  // Si el usuario autenticado es Super Admin, devuelve el token recibido
  if (req.user && req.user.role === 'Super Admin' && req.headers.authorization) {
    const originalToken = req.headers.authorization.replace('Bearer ', '');
    // Elimina la cookie si existe (opcional)
    res.clearCookie('original_token', { httpOnly: true, sameSite: 'none', secure: true });
    return res.json({ token: originalToken });
  }
  // Si no, responde 400
  return res.status(400).json({ message: 'No hay sesión original para restaurar' });
};

module.exports = { loginUser, impersonateTenantAdmin, restoreImpersonation };
