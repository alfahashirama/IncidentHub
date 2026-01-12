const User = require('./User');
const Incident = require('./Incident');

// ==================== ASSOCIATIONS ====================

// Un utilisateur peut créer plusieurs incidents
User.hasMany(Incident, {
  foreignKey: 'createdById',
  as: 'createdIncidents', // Alias pour les requêtes
  onDelete: 'RESTRICT'
});

Incident.belongsTo(User, {
  foreignKey: 'createdById',
  as: 'creator'
});

// Un utilisateur peut être assigné à plusieurs incidents
User.hasMany(Incident, {
  foreignKey: 'assignedToId',
  as: 'assignedIncidents',
  onDelete: 'SET NULL'
});

Incident.belongsTo(User, {
  foreignKey: 'assignedToId',
  as: 'assignedTo'
});

// ==================== EXPORT ====================

module.exports = {
  User,
  Incident
};