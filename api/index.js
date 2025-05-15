// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
const sequelize = require('../config/db');

const authRoutes = require('../routes/authRoutes');
const tenantRoutes = require('../routes/tenantRoutes');
const appointmentRoutes = require('../routes/appointmentRoutes');
const userRoutes = require('../routes/userRoutes');
const medicalRecordRoutes = require('../routes/medicalRecordRoutes');
const medicalExamRoutes = require('../routes/medicalExamRoutes');

dotenv.config();
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicalRecord', medicalRecordRoutes);
app.use('/api/medicalExam', medicalExamRoutes);

// Conectar base de datos en cada ejecución
sequelize.sync()
  .then(() => console.log('📦 Base de datos sincronizada en Vercel'))
  .catch((err) => console.error('❌ Error conectando con DB en Vercel', err));

// Exportar como handler para Vercel
module.exports = app;
module.exports.handler = serverless(app);
