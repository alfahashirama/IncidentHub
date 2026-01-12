require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuration de la connexion à PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,      // Nombre maximum de connexions dans le pool
      min: 0,      // Nombre minimum de connexions
      acquire: 30000,  // Temps max (ms) avant timeout lors de l'acquisition
      idle: 10000      // Temps max (ms) avant libération d'une connexion inactive
    },
    dialectOptions: {
      // En production (GCP), on utilisera des connexions SSL
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      })
    }
  }
);

// Fonction de test de la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1); // Arrête l'application si la DB n'est pas accessible
  }
};

module.exports = { sequelize, testConnection };