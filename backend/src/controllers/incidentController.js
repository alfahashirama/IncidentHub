const { Incident, User } = require('../models');
const { Op } = require('sequelize');
const { incidentsCreated } = require('../utils/metrics');

/**
 * @route   GET /api/incidents
 * @desc    Récupérer tous les incidents (avec filtres optionnels)
 * @access  Private
 */
const getIncidents = async (req, res) => {
  try {
    const { status, priority, assignedTo, createdBy, search } = req.query;
    
    // Construction dynamique des filtres
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (createdBy) {
      where.createdById = createdBy;
    }
    
    // Recherche textuelle (titre ou description)
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Récupère les incidents avec leurs relations
    const incidents = await Incident.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']] // Plus récents en premier
    });
    
    res.status(200).json({
      success: true,
      count: incidents.length,
      data: {
        incidents
      }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching incidents'
    });
  }
};

/**
 * @route   GET /api/incidents/:id
 * @desc    Récupérer un incident par son ID
 * @access  Private
 */
const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });
    
    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Incident not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        incident
      }
    });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching the incident'
    });
  }
};

/**
 * @route   POST /api/incidents
 * @desc    Créer un nouvel incident
 * @access  Private
 */
const createIncident = async (req, res) => {
  try {
    const { title, description, priority, assignedToId } = req.body;
    
    // Validation
    if (!title || !description) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title and description are required'
      });
    }
    
    // Si un assignedToId est fourni, vérifie que l'utilisateur existe
    if (assignedToId) {
      const assignedUser = await User.findByPk(assignedToId);
      if (!assignedUser) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Assigned user not found'
        });
      }
    }
    
    // Crée l'incident
    const incident = await Incident.create({
      title,
      description,
      priority: priority || 'medium',
      status: 'open',
      createdById: req.user.id, // Utilisateur connecté
      assignedToId: assignedToId || null
    });
    
    // Récupère l'incident avec ses relations
    const incidentWithRelations = await Incident.findByPk(incident.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      data: {
        incident: incidentWithRelations
      }
    });
    incidentsCreated.inc();

  } catch (error) {
    console.error('Create incident error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while creating the incident'
    });
  }
};

/**
 * @route   PUT /api/incidents/:id
 * @desc    Mettre à jour un incident
 * @access  Private
 */
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assignedToId } = req.body;
    
    // Récupère l'incident
    const incident = await Incident.findByPk(id);
    
    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Incident not found'
      });
    }
    
    // Vérifie les permissions : 
    // - Admin/Manager : peuvent tout modifier
    // - Creator : peut modifier ses propres incidents
    // - AssignedTo : peut modifier le statut uniquement
    const isCreator = incident.createdById === req.user.id;
    const isAssigned = incident.assignedToId === req.user.id;
    const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);
    
    if (!isCreator && !isAssigned && !isAdminOrManager) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to update this incident'
      });
    }
    
    // Si assignedTo uniquement, peut seulement changer le statut
    if (isAssigned && !isCreator && !isAdminOrManager) {
      if (status) {
        incident.status = status;
      }
    } else {
      // Mise à jour complète
      if (title) incident.title = title;
      if (description) incident.description = description;
      if (priority) incident.priority = priority;
      if (status) incident.status = status;
      if (assignedToId !== undefined) incident.assignedToId = assignedToId;
    }
    
    await incident.save();
    
    // Récupère l'incident mis à jour avec relations
    const updatedIncident = await Incident.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      data: {
        incident: updatedIncident
      }
    });
  } catch (error) {
    console.error('Update incident error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while updating the incident'
    });
  }
};

/**
 * @route   DELETE /api/incidents/:id
 * @desc    Supprimer un incident
 * @access  Private (Admin/Manager ou Creator uniquement)
 */
const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findByPk(id);
    
    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Incident not found'
      });
    }
    
    // Seuls admin, manager ou le créateur peuvent supprimer
    const isCreator = incident.createdById === req.user.id;
    const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);
    
    if (!isCreator && !isAdminOrManager) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to delete this incident'
      });
    }
    
    await incident.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while deleting the incident'
    });
  }
};

/**
 * @route   GET /api/incidents/stats/overview
 * @desc    Obtenir des statistiques sur les incidents
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    
    // Statistiques par statut
    const statsByStatus = await Incident.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Statistiques par priorité
    const statsByPriority = await Incident.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority']
    });
    
    // Total des incidents
    const total = await Incident.count();
    
    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: statsByStatus,
        byPriority: statsByPriority
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching statistics'
    });
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getStats
};