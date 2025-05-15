// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
const sequelize = require('../config/db');
const cors = require('cors');

const authRoutes = require('../routes/authRoutes');
const tenantRoutes = require('../routes/tenantRoutes');
const appointmentRoutes = require('../routes/appointmentRoutes');
const userRoutes = require('../routes/userRoutes');
const medicalRecordRoutes = require('../routes/medicalRecordRoutes');
const medicalExamRoutes = require('../routes/medicalExamRoutes');

dotenv.config();
const app = express();

// Configuración de CORS
app.use(cors({
  origin: '*', // Esto permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 1 day
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/users', userRoutes);
app.use('/medical-records', medicalRecordRoutes);
app.use('/medical-exams', medicalExamRoutes);

// Conectar base de datos en cada ejecución
sequelize.sync()
  .then(() => console.log('📦 Base de datos sincronizada en Vercel'))
  .catch((err) => console.error('❌ Error conectando con DB en Vercel', err));

// Exportar como handler para Vercel
module.exports = app;
module.exports.handler = serverless(app);
