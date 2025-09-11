const express = require('express');
const router = express.Router();
const {
  createMedicalCertificate,
  getSpecialistCertificates,
  getCertificateById,
  updateMedicalCertificate,
  voidMedicalCertificate,
  getPatientCertificates
} = require('../controllers/medicalCertificateController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

// Rutas para especialistas
router.post('/', authenticateToken, authorizeRoles('Especialista'), createMedicalCertificate);
router.get('/specialist', authenticateToken, authorizeRoles('Especialista'), getSpecialistCertificates);
router.put('/:id', authenticateToken, authorizeRoles('Especialista'), updateMedicalCertificate);
router.patch('/:id/void', authenticateToken, authorizeRoles('Especialista'), voidMedicalCertificate);

// Rutas para pacientes
router.get('/patient', authenticateToken, authorizeRoles('Paciente'), getPatientCertificates);

// Rutas compartidas
router.get('/:id', authenticateToken, authorizeRoles('Especialista', 'Paciente', 'Administrador', 'Super Admin'), getCertificateById);

module.exports = router;
