const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticate = (req, res, next) => {
  console.log('🔍 Headers recibidos:', req.headers);
  console.log('🔍 Authorization header:', req.header('Authorization'));
  
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }

  try {
    console.log('🔑 Token recibido:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Guardamos la información del usuario decodificado
    console.log('✅ Usuario autenticado:', req.user);
    next();
  } catch (err) {
    console.log('❌ Error verificando token:', err.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authenticate;
