// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware básico
app.use(express.json());

// Configuración de CORS básica con logs
app.use((req, res, next) => {
  console.log('🌐 CORS Request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });

  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://uppamed.uppacloud.com', 'https://uppamed.vercel.app'];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  // Solo establecer credentials si el origin está permitido
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request manejado');
    res.status(200).end();
    return;
  }
  next();
});

// Ruta de prueba simple
app.get('/health', (req, res) => {
  console.log('🏥 Health check request');
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({ message: 'UppaMed API v1.0.0' });
});

// Agregar rutas de autenticación gradualmente
try {
  const authRoutes = require('../routes/authRoutes');
  app.use('/auth', authRoutes);
  console.log('✅ Rutas de autenticación cargadas');
} catch (error) {
  console.error('❌ Error cargando rutas de autenticación:', error);
  // Ruta de fallback para login
  app.post('/auth/login', (req, res) => {
    console.log('🔐 Login fallback:', req.body);
    res.status(500).json({ message: 'Servicio de autenticación temporalmente no disponible' });
  });
}

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error('❌ Error en el servidor:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Exportar para Vercel
module.exports = app;
module.exports.handler = serverless(app);
