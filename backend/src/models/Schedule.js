const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateInstructorSheet } = require('../controllers/instructorController');

// Instruktor ili admin može generisati nalog
router.get('/generate', protect, authorize('instructor', 'admin'), generateInstructorSheet);

module.exports = router;
