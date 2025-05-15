const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token proporcionado' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar los datos del usuario al objeto request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware; 