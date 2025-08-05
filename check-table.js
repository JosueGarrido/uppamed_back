const sequelize = require('./config/db');

async function checkTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla medical_exams...\n');
    
    const [results] = await sequelize.query(`
      DESCRIBE medical_exams;
    `);
    
    console.log('📋 Estructura de la tabla medical_exams:');
    console.log('=' .repeat(80));
    console.log('Campo'.padEnd(20) + 'Tipo'.padEnd(25) + 'Null'.padEnd(8) + 'Key'.padEnd(8) + 'Default'.padEnd(15) + 'Extra');
    console.log('=' .repeat(80));
    
    results.forEach(row => {
      console.log(
        row.Field.padEnd(20) + 
        row.Type.padEnd(25) + 
        row.Null.padEnd(8) + 
        (row.Key || '').padEnd(8) + 
        (row.Default || '').padEnd(15) + 
        (row.Extra || '')
      );
    });
    
    console.log('\n✅ Verificación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error verificando la tabla:', error);
  } finally {
    await sequelize.close();
  }
}

checkTable(); 