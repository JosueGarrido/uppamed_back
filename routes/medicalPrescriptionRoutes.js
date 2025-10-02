const express = require('express');
const router = express.Router();
const {
  createMedicalPrescription,
  getSpecialistPrescriptions,
  getPrescriptionById,
  updateMedicalPrescription,
  voidMedicalPrescription,
  getPatientPrescriptions
} = require('../controllers/medicalPrescriptionController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

// Rutas para especialistas
router.post('/', authenticateToken, authorizeRoles('Especialista'), createMedicalPrescription);
router.get('/specialist', authenticateToken, authorizeRoles('Especialista'), getSpecialistPrescriptions);
router.put('/:id', authenticateToken, authorizeRoles('Especialista'), updateMedicalPrescription);
router.patch('/:id/void', authenticateToken, authorizeRoles('Especialista'), voidMedicalPrescription);

// Rutas para pacientes
router.get('/patient', authenticateToken, authorizeRoles('Paciente'), getPatientPrescriptions);

// Rutas compartidas
router.get('/:id', authenticateToken, authorizeRoles('Especialista', 'Paciente', 'Administrador', 'Super Admin'), getPrescriptionById);

module.exports = router;
