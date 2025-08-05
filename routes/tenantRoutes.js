const express = require('express');
const { 
  createTenant, 
  getTenants, 
  getTenantById, 
  updateTenant, 
  deleteTenant, 
  getTenantConfig, 
  updateTenantConfig,
  getMyTenant,
  updateMyTenant,
  getMyTenantConfig,
  updateMyTenantConfig
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

// Configuración avanzada de tenant (Super Admin)
router.get('/:id/config', verifyToken, authorizeRoles('Super Admin'), getTenantConfig);
router.put('/:id/config', verifyToken, authorizeRoles('Super Admin'), updateTenantConfig);

// Rutas para Administradores - acceso a su propio tenant
router.get('/my/tenant', verifyToken, authorizeRoles('Administrador'), getMyTenant);
router.put('/my/tenant', verifyToken, authorizeRoles('Administrador'), updateMyTenant);
router.get('/my/config', verifyToken, authorizeRoles('Administrador'), getMyTenantConfig);
router.put('/my/config', verifyToken, authorizeRoles('Administrador'), updateMyTenantConfig);

module.exports = router;
