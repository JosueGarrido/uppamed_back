const express = require('express');
const { 
  createMedicalRecord, 
  getMedicalRecordsForPatient, 
  getMedicalRecordsForSpecialist, 
  getMedicalRecordsForAdmin, 
  updateMedicalRecord, 
  getMedicalRecordById, 
  deleteMedicalRecord,
  addDiagnosis,
  addEvolutionEntry,
  updateSystemsReview,
  updatePhysicalExamination,
  updateStatus
} = require('../controllers/medicalRecordController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Ruta para crear una historia clínica (solo especialista)
router.post(
  '/',
  authenticate,
  checkRole('Especialista'),
  createMedicalRecord
);

// Ruta para obtener las historias clínicas del paciente logueado (solo paciente o especialista del mismo tenant)
router.get('/', authenticate, checkRole('Paciente'), getMedicalRecordsForPatient);

// Ruta para obtener las historias clínicas creadas por un especialista (solo especialista)
router.get('/specialist', authenticate, checkRole('Especialista'), getMedicalRecordsForSpecialist);

// Ruta para obtener todas las historias clínicas para administradores
router.get('/admin', authenticate, checkRole('Administrador'), getMedicalRecordsForAdmin);

// Ruta para obtener una historia clínica por ID
router.get('/:id', authenticate, checkRole(['Especialista', 'Paciente']), getMedicalRecordById);

// Ruta para actualizar una historia clínica (solo especialista)
router.put('/:id', authenticate, checkRole('Especialista'), updateMedicalRecord);

// Ruta para eliminar una historia clínica (solo especialista)
router.delete('/:id', authenticate, checkRole('Especialista'), deleteMedicalRecord);

// Nuevas rutas para funcionalidades avanzadas de historia clínica

// Agregar diagnóstico a una historia clínica
router.post('/:id/diagnosis', authenticate, checkRole(['Especialista', 'Administrador']), addDiagnosis);

// Agregar entrada de evolución
router.post('/:id/evolution', authenticate, checkRole(['Especialista', 'Administrador']), addEvolutionEntry);

// Actualizar revisión de sistemas
router.put('/:id/systems-review', authenticate, checkRole(['Especialista', 'Administrador']), updateSystemsReview);

// Actualizar examen físico
router.put('/:id/physical-examination', authenticate, checkRole(['Especialista', 'Administrador']), updatePhysicalExamination);

// Cambiar estado de la historia clínica
router.put('/:id/status', authenticate, checkRole(['Especialista', 'Administrador']), updateStatus);

module.exports = router;
