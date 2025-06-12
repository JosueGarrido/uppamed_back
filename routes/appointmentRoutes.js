const express = require('express');
const { createAppointment, getAppointmentsForUser, updateAppointmentNotes, getAppointmentsForTenant, getAppointmentById, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Crear una cita (paciente, admin o super admin pueden crear)
router.post('/:tenantId/appointments', authenticate, checkRole(['Paciente', 'Administrador', 'Super Admin']), createAppointment);

// Ver las citas (paciente ve sus citas, especialista ve sus citas asignadas)
router.get('/', authenticate, getAppointmentsForUser);

// Modificar notas de la cita (solo especialista puede hacerlo)
router.put('/:appointmentId/notes', authenticate, checkRole('Especialista'), updateAppointmentNotes);

// Obtener todas las citas de un tenant (solo admin o super admin)
router.get('/:tenantId/all', authenticate, checkRole(['Administrador', 'Super Admin']), getAppointmentsForTenant);

// CRUD de cita por ID
router.get('/appointments/:appointmentId', authenticate, getAppointmentById);
router.put('/appointments/:appointmentId', authenticate, updateAppointment);
router.delete('/appointments/:appointmentId', authenticate, deleteAppointment);

module.exports = router;
