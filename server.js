const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
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

// Middleware para forzar headers de CORS en todas las rutas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// CORS: Permitir solo el origen local y credenciales para desarrollo
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

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
  sequelize.sync() // Sincroniza la base de datos
    .then(() => console.log('Conexión con la base de datos establecida'))
    .catch((error) => console.error('Error al conectar con la base de datos', error));
});
