const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const medicalExamRoutes = require('./routes/medicalExamRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();
const app = express();

// Configuración de CORS para desarrollo y producción
const allowedOrigins = [
  'http://localhost:3000',
  'https://uppamed-front.vercel.app',
  'https://uppamed-frontend.vercel.app',
  'https://uppamed.uppacloud.com',
  'https://uppamed.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Rutas
app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/users', userRoutes);
app.use('/medicalRecord', medicalRecordRoutes);
app.use('/medicalExam', medicalExamRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3001;  // Usa el puerto desde las variables de entorno o 3001 por defecto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  
  // Solo intentar conectar a la base de datos si las variables están configuradas
  if (process.env.DB_HOST && process.env.DB_NAME) {
    const sequelize = require('./config/db');
    sequelize.sync() // Sincroniza la base de datos
      .then(() => console.log('Conexión con la base de datos establecida'))
      .catch((error) => console.error('Error al conectar con la base de datos', error));
  } else {
    console.log('⚠️  Base de datos no configurada - modo de desarrollo sin BD');
  }
});
