const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ 
      where: { email },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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

    res.json({ 
      token,
      user: userWithoutPassword,
      message: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
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

module.exports = router;
