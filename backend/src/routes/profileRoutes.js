const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

// Dohvat profila: kandidat ili admin
router.get('/:id/profile', protect, async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Nemate dozvolu za pregled profila' });
  }
  next();
}, getProfile);

// Update profila: kandidat ili admin
router.put('/:id/profile', protect, async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Nemate dozvolu za izmjenu profila' });
  }
  next();
}, updateProfile);

module.exports = router;
