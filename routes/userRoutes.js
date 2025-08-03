const express = require('express');
const { registerUser, createGlobalUser, listUsersByTenant, getUserById, updateUser, deleteUser, getAllUsers } = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Super Admin puede crear cualquier tipo de usuario, incluyendo Administradores
router.post('/:tenantId/users', authenticate, checkRole(['Super Admin', 'Administrador']), registerUser);

// Ruta alternativa: Especialistas también pueden crear Pacientes
router.post('/:tenantId/pacientes', authenticate, checkRole(['Especialista', 'Administrador', 'Super Admin']), registerUser);

// Crear Super Admin (usuario global sin tenant)
router.post('/', authenticate, checkRole('Super Admin'), createGlobalUser);

// Obtener todos los usuarios del sistema (solo Super Admin)
router.get('/all', authenticate, checkRole('Super Admin'), getAllUsers);

// Listar usuarios de un tenant (Super Admin, Administrador y Especialista)
router.get('/:tenantId/users', authenticate, checkRole(['Super Admin', 'Administrador', 'Especialista']), listUsersByTenant);

// Obtener usuario por ID
router.get('/users/:id', authenticate, checkRole(['Super Admin', 'Administrador']), getUserById);

// Actualizar usuario
router.put('/users/:id', authenticate, checkRole(['Super Admin', 'Administrador']), updateUser);

// Eliminar usuario
router.delete('/users/:id', authenticate, checkRole(['Super Admin', 'Administrador']), deleteUser);

module.exports = router;
