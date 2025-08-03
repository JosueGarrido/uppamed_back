const express = require('express');
const { createMedicalRecord, getMedicalRecordsForPatient, getMedicalRecordsForSpecialist, updateMedicalRecord, getMedicalRecordById } = require('../controllers/medicalRecordController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Ruta para crear un registro médico (solo especialista)
router.post(
  '/',
  authenticate,
  checkRole('Especialista'),
  createMedicalRecord
);

// Ruta para obtener los registros médicos del paciente logueado (solo paciente o especialista del mismo tenant)
router.get('/', authenticate, checkRole('Paciente'), getMedicalRecordsForPatient);

// Ruta para obtener los registros médicos creados por un especialista (solo especialista)
router.get('/specialist', authenticate, checkRole('Especialista'), getMedicalRecordsForSpecialist);

// Ruta para obtener un registro médico por ID
router.get('/:id', authenticate, checkRole(['Especialista', 'Paciente']), getMedicalRecordById);

// Ruta para actualizar un registro médico (solo especialista)
router.put('/:id', authenticate, checkRole('Especialista'), updateMedicalRecord);

module.exports = router;
