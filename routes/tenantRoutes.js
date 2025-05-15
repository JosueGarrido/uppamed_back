const express = require('express');
const { 
  createTenant, 
  getTenants, 
  getTenantById, 
  updateTenant, 
  deleteTenant 
} = require('../controllers/tenantController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');

const router = express.Router();

// Rutas protegidas por autenticación y rol de Super Admin
router.post('/', verifyToken, authorizeRoles('Super Admin'), createTenant);
router.get('/', verifyToken, authorizeRoles('Super Admin'), getTenants);
router.get('/:id', verifyToken, authorizeRoles('Super Admin'), getTenantById);
router.put('/:id', verifyToken, authorizeRoles('Super Admin'), updateTenant);
router.delete('/:id', verifyToken, authorizeRoles('Super Admin'), deleteTenant);

module.exports = router;
