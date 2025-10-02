// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de CORS para desarrollo y producción - ACTUALIZADO 2025-10-02
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
  res.json({ status: 'ok', message: 'API funcionando', timestamp: new Date().toISOString() });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ message: 'UppaMed API v1.0.0', status: 'running', updated: new Date().toISOString() });
});

// Cargar rutas de forma segura
console.log('🔄 Iniciando carga de rutas...');

try {
  // Cargar rutas una por una con manejo de errores individual
  const authRoutes = require('../routes/authRoutes');
  app.use('/auth', authRoutes);
  console.log('✅ Ruta /auth cargada');
} catch (error) {
  console.error('❌ Error cargando /auth:', error.message);
}

try {
  const tenantRoutes = require('../routes/tenantRoutes');
  app.use('/tenants', tenantRoutes);
  console.log('✅ Ruta /tenants cargada');
} catch (error) {
  console.error('❌ Error cargando /tenants:', error.message);
}

try {
  const appointmentRoutes = require('../routes/appointmentRoutes');
  app.use('/appointments', appointmentRoutes);
  console.log('✅ Ruta /appointments cargada');
} catch (error) {
  console.error('❌ Error cargando /appointments:', error.message);
}

try {
  const userRoutes = require('../routes/userRoutes');
  app.use('/users', userRoutes);
  console.log('✅ Ruta /users cargada');
} catch (error) {
  console.error('❌ Error cargando /users:', error.message);
}

try {
  const medicalRecordRoutes = require('../routes/medicalRecordRoutes');
  app.use('/medical-records', medicalRecordRoutes);
  console.log('✅ Ruta /medical-records cargada');
} catch (error) {
  console.error('❌ Error cargando /medical-records:', error.message);
}

try {
  const medicalExamRoutes = require('../routes/medicalExamRoutes');
  app.use('/medical-exams', medicalExamRoutes);
  console.log('✅ Ruta /medical-exams cargada');
} catch (error) {
  console.error('❌ Error cargando /medical-exams:', error.message);
}

try {
  const specialistRoutes = require('../routes/specialistRoutes');
  app.use('/specialists', specialistRoutes);
  console.log('✅ Ruta /specialists cargada');
} catch (error) {
  console.error('❌ Error cargando /specialists:', error.message);
}

try {
  const medicalCertificateRoutes = require('../routes/medicalCertificateRoutes');
  app.use('/medicalCertificates', medicalCertificateRoutes);
  console.log('✅ Ruta /medicalCertificates cargada');
} catch (error) {
  console.error('❌ Error cargando ruta /medicalCertificates:', error.message);
}

console.log('📊 Carga de rutas completada');

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

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  
  // Log detallado del error
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Exportar para Vercel
module.exports = app;
module.exports.handler = serverless(app);

// Iniciar servidor local si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  });
}
