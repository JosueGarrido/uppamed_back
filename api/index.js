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

// Middleware para forzar headers de CORS en todas las rutas (Vercel serverless)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Configuración de CORS completamente abierta
//app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/users', userRoutes);
app.use('/medical-records', medicalRecordRoutes);
app.use('/medical-exams', medicalExamRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ message: 'UppaMed API' });
});

// Conectar base de datos en cada ejecución
sequelize.sync()
  .then(() => console.log('📦 Base de datos sincronizada en Vercel'))
  .catch((err) => console.error('❌ Error conectando con DB en Vercel', err));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Exportar como handler para Vercel
module.exports = app;
module.exports.handler = serverless(app);
