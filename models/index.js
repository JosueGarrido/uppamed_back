const User = require('./user');
const Tenant = require('./tenant');
const Appointment = require('./appointment');
const MedicalRecord = require('./medicalRecord');
const MedicalExam = require('./medicalExam');
const MedicalCertificate = require('./medicalCertificate');
const MedicalPrescription = require('./medicalPrescription');
const SpecialistSchedule = require('./specialistSchedule');
const SpecialistBreak = require('./specialistBreak');

// Asociaciones básicas
try {
  // Asociación User-Tenant
  User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
  Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });

  // Asociaciones para citas
  Appointment.belongsTo(User, { as: 'appointmentSpecialist', foreignKey: 'specialist_id' });
  Appointment.belongsTo(User, { as: 'appointmentPatient', foreignKey: 'patient_id' });
  Appointment.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para registros médicos
  MedicalRecord.belongsTo(User, { foreignKey: 'patient_id', as: 'recordPatient' });
  MedicalRecord.belongsTo(User, { foreignKey: 'specialist_id', as: 'recordSpecialist' });
  MedicalRecord.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para exámenes médicos
  MedicalExam.belongsTo(User, { foreignKey: 'patient_id', as: 'examPatient' });
  MedicalExam.belongsTo(User, { foreignKey: 'specialist_id', as: 'examSpecialist' });
  MedicalExam.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para certificados médicos
  MedicalCertificate.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  MedicalCertificate.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });
  MedicalCertificate.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para recetas médicas
  MedicalPrescription.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  MedicalPrescription.belongsTo(User, { foreignKey: 'specialist_id', as: 'specialist' });
  MedicalPrescription.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

  // Asociaciones para horarios de especialistas
  SpecialistSchedule.belongsTo(User, { foreignKey: 'specialist_id', as: 'scheduleSpecialist' });
  SpecialistSchedule.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
  User.hasMany(SpecialistSchedule, { foreignKey: 'specialist_id', as: 'schedules' });

  // Asociaciones para breaks de especialistas
  SpecialistBreak.belongsTo(User, { foreignKey: 'specialist_id', as: 'breakSpecialist' });
  SpecialistBreak.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
  User.hasMany(SpecialistBreak, { foreignKey: 'specialist_id', as: 'breaks' });

  console.log('✅ Asociaciones de modelos configuradas correctamente');
} catch (error) {
  console.error('❌ Error configurando asociaciones:', error);
}

module.exports = {
  User,
  Tenant,
  Appointment,
  MedicalRecord,
  MedicalExam,
  MedicalCertificate,
  MedicalPrescription,
  SpecialistSchedule,
  SpecialistBreak
}; 