// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware básico
app.use(express.json());

// Configuración de CORS básica
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Exportar para Vercel
module.exports = app;
module.exports.handler = serverless(app);
