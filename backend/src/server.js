require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// CORS - Permet au frontend d'appeler l'API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parser le JSON dans les requêtes
app.use(express.json());

// Parser les données URL-encoded (formulaires)
app.use(express.urlencoded({ extended: true }));

// Log des requêtes (pour debug)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Route de santé (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'IncidentHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to IncidentHub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      incidents: '/api/incidents'
    }
  });
});

// API Routes - IMPORTANT : AVANT le 404 handler
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== DÉMARRAGE DU SERVEUR ====================
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await testConnection();
    
    // Importe les modèles et leurs associations
    const { User, Incident } = require('./models');
    
    // Synchronise les modèles avec la base de données
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: ${process.env.DB_NAME}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
      console.log(`\n📍 Available routes:`);
      console.log(`   GET  /`);
      console.log(`   GET  /health`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/auth/me`);
      console.log(`   GET  /api/incidents`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Lancement
startServer();