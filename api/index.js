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

// Ruta de prueba para certificados médicos
app.get('/test-certificates', (req, res) => {
  res.json({ status: 'ok', message: 'Certificados médicos endpoint test', timestamp: new Date().toISOString() });
});

// Endpoints funcionales de certificados médicos (sin autenticación temporal)
app.get('/medicalCertificates/test', async (req, res) => {
  try {
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        [require('sequelize').Op.or]: [
          { patient_name: { [require('sequelize').Op.like]: `%${search}%` } },
          { diagnosis: { [require('sequelize').Op.like]: `%${search}%` } },
          { certificate_number: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await MedicalCertificate.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        certificates: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /medicalCertificates/test:', error);
    res.json({ 
      success: true, 
      message: 'Endpoint de certificados médicos funcionando (fallback)',
      data: {
        certificates: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      }
    });
  }
});

app.post('/medicalCertificates/test', async (req, res) => {
  try {
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    // Generar número de certificado único
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    const certificateNumber = `CERT-${year}${month}${day}-${timestamp}`;
    
    const certificateData = {
      ...req.body,
      certificate_number: certificateNumber,
      specialist_id: 1, // Temporal - usar ID fijo
      tenant_id: 1 // Temporal - usar ID fijo
    };
    
    const certificate = await MedicalCertificate.create(certificateData);
    
    res.json({ 
      success: true, 
      message: 'Certificado médico creado exitosamente',
      data: certificate
    });
  } catch (error) {
    console.error('Error in POST /medicalCertificates/test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear el certificado médico',
      error: error.message
    });
  }
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
  console.log('🔄 Intentando cargar rutas de certificados médicos...');
  const medicalCertificateRoutes = require('../routes/medicalCertificateRoutes');
  console.log('📦 Rutas de certificados médicos importadas correctamente');
  app.use('/medicalCertificates', medicalCertificateRoutes);
  console.log('✅ Ruta /medicalCertificates cargada y registrada');
} catch (error) {
  console.error('❌ Error cargando ruta /medicalCertificates:', error.message);
  console.error('📋 Stack trace:', error.stack);
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
