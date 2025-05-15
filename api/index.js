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

// Configuración de CORS completamente abierta
app.use(cors());

// Asegurar que las solicitudes OPTIONS sean manejadas correctamente
app.options('*', cors());

// Middleware para parsear JSON
app.use(express.json());

// Base path para la API
const apiRouter = express.Router();

// Rutas de la API
apiRouter.use('/auth', authRoutes);
apiRouter.use('/tenants', tenantRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/medical-records', medicalRecordRoutes);
apiRouter.use('/medical-exams', medicalExamRoutes);

// Montar todas las rutas bajo /api
app.use('/', apiRouter);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Conectar base de datos en cada ejecución
sequelize.sync()
  .then(() => console.log('📦 Base de datos sincronizada en Vercel'))
  .catch((err) => console.error('❌ Error conectando con DB en Vercel', err));

// Exportar como handler para Vercel
module.exports = app;
module.exports.handler = serverless(app);
