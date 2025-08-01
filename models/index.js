const User = require('./user');
const Tenant = require('./tenant');
const Appointment = require('./appointment');
const MedicalRecord = require('./medicalRecord');
const MedicalExam = require('./medicalExam');

// Asociaciones básicas
try {
  // Asociación User-Tenant
  User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
  Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });

  // Asociaciones para citas
  Appointment.belongsTo(User, { as: 'specialist', foreignKey: 'specialist_id' });
  Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patient_id' });
  Appointment.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para registros médicos
  MedicalRecord.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  MedicalRecord.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });
  MedicalRecord.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para exámenes médicos
  MedicalExam.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  MedicalExam.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });
  MedicalExam.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  console.log('✅ Asociaciones de modelos configuradas correctamente');
} catch (error) {
  console.error('❌ Error configurando asociaciones:', error);
}

module.exports = {
  User,
  Tenant,
  Appointment,
  MedicalRecord,
  MedicalExam
}; 