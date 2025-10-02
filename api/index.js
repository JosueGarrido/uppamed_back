// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Headers:`, {
    authorization: req.headers.authorization ? 'Bearer ***' : 'none',
    contentType: req.headers['content-type'],
    origin: req.headers.origin
  });
  next();
});

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
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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

// Endpoint de prueba para verificar logs
app.post('/test-logs', (req, res) => {
  console.log('🧪 TEST LOGS - Endpoint ejecutado');
  console.log('🧪 Headers recibidos:', req.headers);
  console.log('🧪 Body recibido:', req.body);
  
  res.json({ 
    success: true, 
    message: 'Logs de prueba',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    body: req.body
  });
});

// Endpoint de prueba para verificar si los cambios se están desplegando
app.post('/test-deployment', (req, res) => {
  console.log('🚀 TEST DEPLOYMENT - Cambios desplegados correctamente');
  
  res.json({ 
    success: true, 
    message: 'Cambios desplegados - ' + new Date().toISOString(),
    version: 'v2.0'
  });
});

// Endpoint de debug para verificar autenticación
app.post('/debug-auth', async (req, res) => {
  console.log('🔍 POST /debug-auth - Headers recibidos:', {
    authorization: req.headers.authorization,
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent']
  });
  
  const token = req.headers.authorization?.split(' ')[1];
  
  console.log('🔍 Token extraído:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    jwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET?.length
  });
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided',
      debug: {
        hasAuthHeader: !!req.headers.authorization,
        authHeader: req.headers.authorization
      }
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Token verificado:', decoded);
    
    res.json({
      success: true,
      message: 'Token válido',
      decoded: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        tenant_id: decoded.tenant_id
      }
    });
  } catch (error) {
    console.error('❌ Error verificando token:', {
      message: error.message,
      name: error.name
    });
    
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message,
      debug: {
        jwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length
      }
    });
  }
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

// Endpoints reales de certificados médicos con autenticación
app.post('/medicalCertificates', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden crear certificados.' });
    }
    
    // Procesar creación de certificado
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
      specialist_id: req.user.id,
      tenant_id: req.user.tenant_id
    };
    
    const certificate = await MedicalCertificate.create(certificateData);
    
    res.json({ 
      success: true, 
      message: 'Certificado médico creado exitosamente',
      data: certificate
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

app.get('/medicalCertificates/specialist', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden ver certificados.' });
    }
    
    // Procesar obtención de certificados
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {
      specialist_id: req.user.id
    };
    
    if (search) {
      whereClause = {
        ...whereClause,
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
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Obtener certificados del paciente (DEBE IR ANTES de /:id para evitar conflicto de rutas)
app.get('/medicalCertificates/patient', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea paciente
    if (req.user.role !== 'Paciente') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo pacientes pueden ver sus certificados.' });
    }
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Obtener todos los certificados del paciente (activos y anulados)
    const { count, rows } = await MedicalCertificate.findAndCountAll({
      where: {
        patient_id: req.user.id
      },
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
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Obtener certificado por ID
app.get('/medicalCertificates/:id', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    // Construir la cláusula WHERE según el rol del usuario
    let whereClause = { id: req.params.id };
    
    if (req.user.role === 'Especialista') {
      // Los especialistas solo pueden ver sus propios certificados
      whereClause.specialist_id = req.user.id;
    } else if (req.user.role === 'Paciente') {
      // Los pacientes solo pueden ver certificados donde ellos son el paciente
      whereClause.patient_id = req.user.id;
    } else {
      // Otros roles no tienen acceso
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este certificado'
      });
    }
    
    const certificate = await MedicalCertificate.findOne({
      where: whereClause
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: certificate
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Actualizar certificado médico
app.put('/medicalCertificates/:id', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden editar certificados.' });
    }
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    const certificate = await MedicalCertificate.findOne({
      where: {
        id: req.params.id,
        specialist_id: req.user.id // Solo puede editar sus propios certificados
      }
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }
    
    // No permitir editar certificados anulados
    if (certificate.status === 'anulado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar un certificado anulado'
      });
    }
    
    await certificate.update(req.body);
    
    res.json({
      success: true,
      message: 'Certificado actualizado exitosamente',
      data: certificate
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Anular certificado médico
app.patch('/medicalCertificates/:id/void', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden anular certificados.' });
    }
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalCertificate = require('../models/medicalCertificate')(sequelize, DataTypes);
    
    const certificate = await MedicalCertificate.findOne({
      where: {
        id: req.params.id,
        specialist_id: req.user.id // Solo puede anular sus propios certificados
      }
    });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }
    
    // Verificar que no esté ya anulado
    if (certificate.status === 'anulado') {
      return res.status(400).json({
        success: false,
        message: 'El certificado ya está anulado'
      });
    }
    
    await certificate.update({ 
      status: 'anulado',
      void_reason: req.body.reason || 'Anulado por el especialista',
      void_date: new Date()
    });
    
    res.json({
      success: true,
      message: 'Certificado anulado exitosamente',
      data: certificate
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Endpoints reales de recetas médicas con autenticación
// IMPORTANTE: Las rutas específicas deben ir ANTES que las rutas con parámetros

app.post('/medicalPrescriptions', async (req, res) => {
  console.log('🚀 POST /medicalPrescriptions - ENDPOINT EJECUTADO');
  
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  
  // Debug info para incluir en respuesta
  const debugInfo = {
    hasAuthHeader: !!req.headers.authorization,
    hasToken: !!token,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...',
    jwtSecret: !!process.env.JWT_SECRET,
    timestamp: new Date().toISOString()
  };
  
  console.log('🔍 POST /medicalPrescriptions - Autenticación:', debugInfo);
  
  if (!token) {
    console.log('❌ No se encontró token en el header Authorization');
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido',
      debug: debugInfo
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ Token verificado correctamente:', {
      userId: decoded.id,
      userRole: decoded.role,
      userEmail: decoded.email
    });
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Solo especialistas pueden crear recetas.',
        debug: { ...debugInfo, decoded: { id: decoded.id, role: decoded.role } }
      });
    }
    
    // Procesar creación de receta
    // Cargar Sequelize y modelos correctamente
    console.log('🔍 Cargando modelos para receta médica...');
    
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    
    console.log('🔍 Sequelize cargado:', !!sequelize);
    console.log('🔍 DataTypes cargado:', !!DataTypes);
    
    let MedicalPrescription;
    try {
      MedicalPrescription = require('../models/medicalPrescription')(sequelize, DataTypes);
      console.log('✅ Modelo MedicalPrescription cargado:', !!MedicalPrescription);
    } catch (modelError) {
      console.error('❌ Error cargando modelo MedicalPrescription:', modelError);
      return res.status(500).json({
        success: false,
        message: 'Error cargando modelo de receta médica',
        error: modelError.message,
        debug: debugInfo
      });
    }
    
    // Generar número de receta único
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    const prescriptionNumber = `REC-${year}${month}${day}-${timestamp}`;
    
    // Limpiar datos antes de guardar
    const prescriptionData = {
      ...req.body,
      prescription_number: prescriptionNumber,
      specialist_id: req.user.id,
      tenant_id: req.user.tenant_id,
      // Convertir strings vacíos o 'Invalid date' a null para campos de fecha
      next_appointment_date: req.body.next_appointment_date && req.body.next_appointment_date !== 'Invalid date' 
        ? req.body.next_appointment_date 
        : null,
      issue_date: req.body.issue_date || new Date().toISOString().split('T')[0]
    };
    
    const prescription = await MedicalPrescription.create(prescriptionData);
    
    res.json({ 
      success: true, 
      message: 'Receta médica creada exitosamente',
      data: prescription
    });
  } catch (authError) {
    console.error('❌ Error en endpoint:', {
      message: authError.message,
      name: authError.name,
      stack: authError.stack
    });
    
    // Distinguir entre errores de autenticación y errores de base de datos
    if (authError.name === 'JsonWebTokenError' || authError.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'Token inválido',
        error: authError.message,
        errorName: authError.name,
        debug: debugInfo
      });
    } else {
      // Error de base de datos u otro error
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear la receta médica',
        error: authError.message,
        errorName: authError.name,
        debug: debugInfo
      });
    }
  }
});

app.get('/medicalPrescriptions/specialist', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden ver recetas.' });
    }
    
    // Procesar obtención de recetas
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalPrescription = require('../models/medicalPrescription')(sequelize, DataTypes);
    
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {
      specialist_id: req.user.id
    };
    
    if (search) {
      whereClause = {
        ...whereClause,
        [require('sequelize').Op.or]: [
          { patient_name: { [require('sequelize').Op.like]: `%${search}%` } },
          { diagnosis: { [require('sequelize').Op.like]: `%${search}%` } },
          { prescription_number: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await MedicalPrescription.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        prescriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Obtener recetas del paciente (DEBE IR ANTES de /:id para evitar conflicto de rutas)
app.get('/medicalPrescriptions/patient', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea paciente
    if (req.user.role !== 'Paciente') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo pacientes pueden ver sus recetas.' });
    }
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalPrescription = require('../models/medicalPrescription')(sequelize, DataTypes);
    
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {
      patient_id: req.user.id
    };
    
    if (search) {
      whereClause = {
        ...whereClause,
        [require('sequelize').Op.or]: [
          { diagnosis: { [require('sequelize').Op.like]: `%${search}%` } },
          { prescription_number: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await MedicalPrescription.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: {
        prescriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Obtener receta por ID
app.get('/medicalPrescriptions/:id', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalPrescription = require('../models/medicalPrescription')(sequelize, DataTypes);
    
    // Construir la cláusula WHERE según el rol del usuario
    let whereClause = { id: req.params.id };
    
    if (req.user.role === 'Especialista') {
      // Los especialistas solo pueden ver sus propias recetas
      whereClause.specialist_id = req.user.id;
    } else if (req.user.role === 'Paciente') {
      // Los pacientes solo pueden ver recetas donde ellos son el paciente
      whereClause.patient_id = req.user.id;
    } else {
      // Otros roles no tienen acceso
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta receta'
      });
    }
    
    const prescription = await MedicalPrescription.findOne({
      where: whereClause
    });
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: prescription
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

// Actualizar receta médica
app.put('/medicalPrescriptions/:id', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden editar recetas.' });
    }
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalPrescription = require('../models/medicalPrescription')(sequelize, DataTypes);
    
    const prescription = await MedicalPrescription.findOne({
      where: {
        id: req.params.id,
        specialist_id: req.user.id // Solo puede editar sus propias recetas
      }
    });
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    // No permitir editar recetas anuladas
    if (prescription.status === 'anulado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una receta anulada'
      });
    }
    
    // Limpiar datos antes de actualizar
    const updateData = {
      ...req.body,
      // Convertir strings vacíos o 'Invalid date' a null para campos de fecha
      next_appointment_date: req.body.next_appointment_date && req.body.next_appointment_date !== 'Invalid date' 
        ? req.body.next_appointment_date 
        : null,
      issue_date: req.body.issue_date && req.body.issue_date !== 'Invalid date'
        ? req.body.issue_date
        : prescription.issue_date
    };
    
    await prescription.update(updateData);
    
    res.json({
      success: true,
      message: 'Receta actualizada exitosamente',
      data: prescription
    });
  } catch (authError) {
    console.error('Error en actualización:', authError);
    
    // Distinguir entre errores de autenticación y errores de base de datos
    if (authError.name === 'JsonWebTokenError' || authError.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'Token inválido',
        error: authError.message,
        errorName: authError.name
      });
    } else {
      // Error de base de datos u otro error
      res.status(500).json({ 
        success: false, 
        message: 'Error al actualizar la receta médica',
        error: authError.message,
        errorName: authError.name
      });
    }
  }
});

// Anular receta médica
app.patch('/medicalPrescriptions/:id/void', async (req, res) => {
  // Verificación de autenticación manual
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar que sea especialista
    if (req.user.role !== 'Especialista') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo especialistas pueden anular recetas.' });
    }
    
    // Cargar Sequelize y modelos correctamente
    const sequelize = require('../config/db');
    const { DataTypes } = require('sequelize');
    const MedicalPrescription = require('../models/medicalPrescription')(sequelize, DataTypes);
    
    const prescription = await MedicalPrescription.findOne({
      where: {
        id: req.params.id,
        specialist_id: req.user.id // Solo puede anular sus propias recetas
      }
    });
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    // Verificar que no esté ya anulada
    if (prescription.status === 'anulado') {
      return res.status(400).json({
        success: false,
        message: 'La receta ya está anulada'
      });
    }
    
    await prescription.update({ 
      status: 'anulado',
      observations: req.body.reason || 'Anulada por el especialista'
    });
    
    res.json({
      success: true,
      message: 'Receta anulada exitosamente',
      data: prescription
    });
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido',
      error: authError.message
    });
  }
});

try {
  console.log('🔄 Intentando cargar rutas de certificados médicos...');
  const medicalCertificateRoutes = require('../routes/medicalCertificateRoutes');
  console.log('📦 Rutas de certificados médicos importadas correctamente');
  // app.use('/medicalCertificates', medicalCertificateRoutes); // Comentado temporalmente
  console.log('✅ Ruta /medicalCertificates cargada y registrada (usando endpoints directos)');
} catch (error) {
  console.error('❌ Error cargando ruta /medicalCertificates:', error.message);
  console.error('📋 Stack trace:', error.stack);
}

// Las rutas de recetas médicas están implementadas directamente arriba
console.log('✅ Endpoints de recetas médicas implementados directamente');

console.log('📊 Carga de rutas completada');

// Rutas de fallback para evitar errores 404 (movidas al final)

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
