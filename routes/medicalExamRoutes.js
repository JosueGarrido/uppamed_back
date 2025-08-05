// routes/medicalExamRoutes.js
const express = require('express');
const { 
  createMedicalExam, 
  getMedicalExamsForUser, 
  getMedicalExamById,
  updateMedicalExam,
  deleteMedicalExam,
  getExamStatistics,
  getExamsRequiringFollowup
} = require('../controllers/medicalExamController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/upload');

const router = express.Router();

// Crear examen médico (solo Especialista)
router.post(
  '/',
  authenticate,
  checkRole('Especialista'),
  upload.array('attachments', 10), // Máximo 10 archivos
  createMedicalExam
);

// Obtener exámenes médicos del usuario
router.get(
  '/',
  authenticate,
  getMedicalExamsForUser
);

// Obtener un examen médico específico
router.get(
  '/:id',
  authenticate,
  getMedicalExamById
);

// Actualizar un examen médico (solo Especialista)
router.put(
  '/:id',
  authenticate,
  checkRole('Especialista'),
  upload.array('attachments', 10),
  updateMedicalExam
);

// Eliminar un examen médico (solo Especialista)
router.delete(
  '/:id',
  authenticate,
  checkRole('Especialista'),
  deleteMedicalExam
);

// Obtener estadísticas de exámenes
router.get(
  '/statistics/summary',
  authenticate,
  getExamStatistics
);

// Obtener exámenes que requieren seguimiento
router.get(
  '/followup/required',
  authenticate,
  getExamsRequiringFollowup
);

module.exports = router;
