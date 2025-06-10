const express = require('express');
const { registerUser, listUsersByTenant, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Super Admin puede crear cualquier tipo de usuario, incluyendo Administradores
router.post('/:tenantId/users', authenticate, checkRole(['Super Admin', 'Administrador']), registerUser);

// Ruta alternativa: Especialistas también pueden crear Pacientes
router.post('/:tenantId/pacientes', authenticate, checkRole(['Especialista', 'Administrador', 'Super Admin']), registerUser);

// Opción libre (no protegida, solo útil para testing si la dejas)
router.post('/', registerUser);

// Listar usuarios de un tenant
router.get('/:tenantId/users', authenticate, checkRole(['Super Admin', 'Administrador']), listUsersByTenant);

// Obtener usuario por ID
router.get('/users/:id', authenticate, checkRole(['Super Admin', 'Administrador']), getUserById);

// Actualizar usuario
router.put('/users/:id', authenticate, checkRole(['Super Admin', 'Administrador']), updateUser);

// Eliminar usuario
router.delete('/users/:id', authenticate, checkRole(['Super Admin', 'Administrador']), deleteUser);

module.exports = router;
