const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
  // Clé primaire UUID
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  // Informations de l'incident
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title cannot be empty' },
      len: {
        args: [5, 200],
        msg: 'Title must be between 5 and 200 characters'
      }
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description cannot be empty' },
      len: {
        args: [10, 5000],
        msg: 'Description must be between 10 and 5000 characters'
      }
    }
  },
  
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
    allowNull: false,
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'critical']],
        msg: 'Priority must be low, medium, high, or critical'
      }
    }
  },
  
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
    allowNull: false,
    validate: {
      isIn: {
        args: [['open', 'in_progress', 'resolved', 'closed']],
        msg: 'Status must be open, in_progress, resolved, or closed'
      }
    }
  },
  
  // Clés étrangères (UUID des utilisateurs)
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by_id', // Nom de la colonne en DB
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT' // Ne peut pas supprimer un user qui a créé des incidents
  },
  
  assignedToId: {
    type: DataTypes.UUID,
    allowNull: true, // Peut être non assigné
    field: 'assigned_to_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL' // Si l'assigné est supprimé, on met NULL
  },
  
  // Dates de résolution/fermeture
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at'
  }
}, {
  tableName: 'incidents',
  timestamps: true,
  underscored: true,
  
  // Hooks pour gérer les dates automatiquement
  hooks: {
    beforeUpdate: async (incident) => {
      // Si le statut passe à "resolved", on enregistre la date
      if (incident.changed('status') && incident.status === 'resolved' && !incident.resolvedAt) {
        incident.resolvedAt = new Date();
      }
      
      // Si le statut passe à "closed", on enregistre la date
      if (incident.changed('status') && incident.status === 'closed' && !incident.closedAt) {
        incident.closedAt = new Date();
      }
    }
  },
  
  // Index pour optimiser les requêtes fréquentes
  indexes: [
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['created_by_id'] },
    { fields: ['assigned_to_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Incident;