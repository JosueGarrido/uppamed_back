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

// Configurar CORS para permitir frontend local y credenciales
app.use(cors({
  origin: 'http://localhost:3000', // Cambia si tu frontend corre en otro puerto
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicalRecord', medicalRecordRoutes);
app.use('/api/medicalExam', medicalExamRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;  // Usa el puerto desde las variables de entorno o 3000 por defecto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  sequelize.sync() // Sincroniza la base de datos
    .then(() => console.log('Conexión con la base de datos establecida'))
    .catch((error) => console.error('Error al conectar con la base de datos', error));
});
