const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getCandidateStats, getAllCandidatesStats } = require('../controllers/dashboardController');

// Pregled statistike pojedinog kandidata
router.get('/candidate/:id', protect, authorize('admin'), getCandidateStats);

// Pregled statistike svih kandidata
router.get('/all', protect, authorize('admin'), getAllCandidatesStats);

module.exports = router;
