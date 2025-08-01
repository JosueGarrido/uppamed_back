// init.js
const sequelize = require('./config/db');

// importa tus modelos y asociaciones
require('./models/index');

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
