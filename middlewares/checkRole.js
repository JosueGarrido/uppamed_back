const checkRole = (roles) => {
  return (req, res, next) => {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado: Rol insuficiente' });
    }

    next();
  };
};

module.exports = checkRole;
