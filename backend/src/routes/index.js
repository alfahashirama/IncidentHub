const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const incidentRoutes = require('./incidentRoutes');

// Montage des routes
router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);

module.exports = router;