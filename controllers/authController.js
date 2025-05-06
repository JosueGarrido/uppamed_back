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

module.exports = { loginUser };
