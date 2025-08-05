// routes/medicalExamRoutes.js
const express = require('express');
const { createMedicalExam, getMedicalExamsForUser, deleteMedicalExam } = require('../controllers/medicalExamController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/',
  authenticate,
  checkRole('Especialista'),
  upload.array('attachments'), // acepta archivos
  createMedicalExam
);

router.get(
  '/',
  authenticate,
  getMedicalExamsForUser
);

router.delete(
  '/:id',
  authenticate,
  checkRole('Especialista'),
  deleteMedicalExam
);

module.exports = router;
