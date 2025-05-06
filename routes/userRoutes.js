const express = require('express');
const { registerUser } = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Super Admin puede crear cualquier tipo de usuario, incluyendo Administradores
router.post('/:tenantId/users', authenticate, checkRole(['Super Admin', 'Administrador']), registerUser);

// Ruta alternativa: Especialistas también pueden crear Pacientes
router.post('/:tenantId/pacientes', authenticate, checkRole(['Especialista', 'Administrador', 'Super Admin']), registerUser);

// Opción libre (no protegida, solo útil para testing si la dejas)
router.post('/', registerUser);

module.exports = router;
