module.exports = (...allowedRoles) => {
    return (req, res, next) => {
      const { role } = req.user;
  
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'No tienes permiso para acceder a esta ruta' });
      }
  
      next();
    };
  };
  