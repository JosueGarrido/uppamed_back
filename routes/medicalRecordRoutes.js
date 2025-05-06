const express = require('express');
const { createMedicalRecord, getMedicalRecordsForPatient, getMedicalRecordsForSpecialist } = require('../controllers/medicalRecordController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Ruta para crear un registro médico (solo especialista)
router.post(
  '/medical-records',
  authenticate,
  checkRole('Especialista'),
  createMedicalRecord
);

// Ruta para obtener los registros médicos del paciente logueado (solo paciente o especialista del mismo tenant)
router.get('/medical-records', authenticate, checkRole('Paciente'), getMedicalRecordsForPatient);

// Ruta para obtener los registros médicos creados por un especialista (solo especialista)
router.get('/medical-records/specialist', authenticate, checkRole('Especialista'), getMedicalRecordsForSpecialist);

module.exports = router;
