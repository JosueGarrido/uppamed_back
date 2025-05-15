// init.js
const sequelize = require('./config/db');

// importa tus modelos
require('./models/user');
require('./models/tenant');
require('./models/medicalRecord');
require('./models/medicalExam');
require('./models/appointment');

async function initDB() {
  try {
    await sequelize.sync({ force: true }); // recrea todo
    console.log('✅ Base de datos sincronizada. Tablas creadas desde los modelos.');
    process.exit();
  } catch (err) {
    console.error('❌ Error sincronizando la base de datos:', err);
    process.exit(1);
  }
}

initDB();
