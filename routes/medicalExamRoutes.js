// routes/medicalExamRoutes.js
const express = require('express');
const { createMedicalExam, getMedicalExamsForUser } = require('../controllers/medicalExamController');
const authenticate = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/upload');


const router = express.Router();

router.post(
  '/medical-exams',
  authenticate,
  checkRole('Especialista'),
  upload.array('attachments'), // acepta archivos
  createMedicalExam
);

router.get(
  '/medical-exams',
  authenticate,
  getMedicalExamsForUser
);

module.exports = router;
