const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middlewares/auth');
const {
  getSpecialistSchedule,
  updateSpecialistSchedule,
  checkSpecialistAvailability,
  getAvailableSlots
} = require('../controllers/specialistController');

// Rutas para administradores y super admins
// Obtener horarios de un especialista
router.get('/:tenantId/specialists/:specialistId/schedule', authenticate, getSpecialistSchedule);

// Actualizar horarios de un especialista (solo admin o super admin)
router.put('/:tenantId/specialists/:specialistId/schedule', authenticate, checkRole(['Administrador', 'Super Admin']), updateSpecialistSchedule);

// Verificar disponibilidad de un especialista
router.get('/:tenantId/specialists/:specialistId/availability', authenticate, checkSpecialistAvailability);

// Obtener slots disponibles de un especialista para una fecha
router.get('/:tenantId/specialists/:specialistId/available-slots', authenticate, getAvailableSlots);

// Rutas para especialistas (auto-gestión)
// Obtener mi propio horario
router.get('/my-schedule', authenticate, checkRole('Especialista'), async (req, res) => {
  try {
    const specialistId = req.user.id;
    const tenantId = req.user.tenant_id;
    
    if (!tenantId) {
      return res.status(400).json({ message: 'Especialista no tiene tenant asignado' });
    }

    // Usar el mismo controlador pero con el ID del especialista logueado
    req.params.specialistId = specialistId;
    req.params.tenantId = tenantId;
    
    return getSpecialistSchedule(req, res);
  } catch (error) {
    console.error('Error in my-schedule route:', error);
    res.status(500).json({ message: 'Error al obtener mi horario' });
  }
});

// Actualizar mi propio horario
router.put('/my-schedule', authenticate, checkRole('Especialista'), async (req, res) => {
  try {
    const specialistId = req.user.id;
    const tenantId = req.user.tenant_id;
    
    if (!tenantId) {
      return res.status(400).json({ message: 'Especialista no tiene tenant asignado' });
    }

    // Usar el mismo controlador pero con el ID del especialista logueado
    req.params.specialistId = specialistId;
    req.params.tenantId = tenantId;
    
    return updateSpecialistSchedule(req, res);
  } catch (error) {
    console.error('Error in my-schedule update route:', error);
    res.status(500).json({ message: 'Error al actualizar mi horario' });
  }
});

module.exports = router; 