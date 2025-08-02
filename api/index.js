// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware básico
app.use(express.json());

// Configuración de CORS para desarrollo y producción
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://uppamed-front.vercel.app',
  'https://uppamed-frontend.vercel.app',
  'https://uppamed.vercel.app',
  'https://uppamed.uppacloud.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Ruta de prueba simple
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ message: 'UppaMed API v1.0.0' });
});

// Agregar todas las rutas necesarias
try {
  const authRoutes = require('../routes/authRoutes');
  const tenantRoutes = require('../routes/tenantRoutes');
  const appointmentRoutes = require('../routes/appointmentRoutes');
  const userRoutes = require('../routes/userRoutes');
  const medicalRecordRoutes = require('../routes/medicalRecordRoutes');
  const medicalExamRoutes = require('../routes/medicalExamRoutes');

  // Rutas
  app.use('/auth', authRoutes);
  app.use('/tenants', tenantRoutes);
  app.use('/appointments', appointmentRoutes);
  app.use('/users', userRoutes);
  app.use('/medical-records', medicalRecordRoutes);
  app.use('/medical-exams', medicalExamRoutes);

  console.log('✅ Todas las rutas cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error);
  
  // Rutas de fallback para evitar errores 404
  app.get('/tenants', (req, res) => {
    res.status(500).json({ message: 'Servicio de tenants temporalmente no disponible' });
  });
  
  app.get('/users/all', (req, res) => {
    res.status(500).json({ message: 'Servicio de usuarios temporalmente no disponible' });
  });
  
  app.post('/auth/login', (req, res) => {
    res.status(500).json({ message: 'Servicio de autenticación temporalmente no disponible' });
  });
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Exportar para Vercel
module.exports = app;
module.exports.handler = serverless(app);

// Iniciar servidor local si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
}
