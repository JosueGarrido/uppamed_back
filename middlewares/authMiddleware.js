const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Opcional: puedes buscar al usuario si necesitas más datos
    req.user = decoded; // decoded debe contener { id, username, role, tenant_id }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = verifyToken;
