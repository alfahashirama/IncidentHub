const client = require('prom-client');

// Crée un registre personnalisé
const register = new client.Registry();

// Collecte les métriques par défaut
client.collectDefaultMetrics({ register });

// Compteur : Requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Histogramme : Durée des requêtes
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5],
  registers: [register]
});

// Compteur : Incidents créés
const incidentsCreated = new client.Counter({
  name: 'incidents_created_total',
  help: 'Total number of incidents created',
  registers: [register]
});

// Compteur : Utilisateurs enregistrés
const usersRegistered = new client.Counter({
  name: 'users_registered_total',
  help: 'Total number of users registered',
  registers: [register]
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  incidentsCreated,
  usersRegistered
};