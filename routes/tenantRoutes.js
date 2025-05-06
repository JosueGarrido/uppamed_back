const express = require('express');
const { createTenant, getTenants } = require('../controllers/tenantController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();

// Rutas protegidas por autenticación y rol de Super Admin
router.post('/', verifyToken, authorizeRoles('Super Admin'), createTenant);
router.get('/', verifyToken, authorizeRoles('Super Admin'), getTenants);

module.exports = router;
