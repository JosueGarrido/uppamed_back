const express = require('express');
const { 
  getSpecialistSchedule, 
  updateSpecialistSchedule, 
  checkSpecialistAvailability, 
  getAvailableSlots 
} = require('../controllers/specialistController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Obtener horarios de un especialista
router.get('/:tenantId/specialists/:specialistId/schedule', authenticate, getSpecialistSchedule);

// Actualizar horarios de un especialista (solo admin o super admin)
router.put('/:tenantId/specialists/:specialistId/schedule', authenticate, checkRole(['Administrador', 'Super Admin']), updateSpecialistSchedule);

// Verificar disponibilidad de un especialista
router.get('/:tenantId/specialists/:specialistId/availability', authenticate, checkSpecialistAvailability);

// Obtener slots disponibles de un especialista para una fecha
router.get('/:tenantId/specialists/:specialistId/available-slots', authenticate, getAvailableSlots);

module.exports = router; 