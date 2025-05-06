const express = require('express');
const { createAppointment, getAppointmentsForUser, updateAppointmentNotes } = require('../controllers/appointmentController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Crear una cita (solo paciente puede crear)
router.post('/:tenantId/appointments', authenticate, checkRole('Paciente'), createAppointment);

// Ver las citas (paciente ve sus citas, especialista ve sus citas asignadas)
router.get('/', authenticate, getAppointmentsForUser);

// Modificar notas de la cita (solo especialista puede hacerlo)
router.put('/:appointmentId/notes', authenticate, checkRole('Especialista'), updateAppointmentNotes);

module.exports = router;
