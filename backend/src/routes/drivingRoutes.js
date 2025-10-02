const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  addDrivingSession,
  getDrivingSessions
} = require('../controllers/drivingController');

// Dodavanje vožnje - samo admin ili instruktor
router.post('/', protect, authorize('admin', 'instructor'), addDrivingSession);

// Dohvat vožnji kandidata - kandidat ili admin
router.get('/:id', protect, async (req, res, next) => {
  // Ako nije admin i nije vlasnik profila
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Nemate dozvolu za pregled vožnji' });
  }
  next();
}, getDrivingSessions);

module.exports = router;
