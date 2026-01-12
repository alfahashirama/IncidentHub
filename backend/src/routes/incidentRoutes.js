const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getStats
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

// Routes
router.get('/', getIncidents);
router.get('/stats/overview', getStats);
router.get('/:id', getIncidentById);
router.post('/', createIncident);
router.put('/:id', updateIncident);
router.delete('/:id', deleteIncident);

module.exports = router;