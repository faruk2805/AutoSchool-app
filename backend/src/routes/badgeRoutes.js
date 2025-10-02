const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getBadges, addBadge } = require('../controllers/badgeController');

// Dohvat bedževa (kandidat ili admin)
router.get('/:id/badges', protect, async (req, res, next) => {
  // Samo admin ili sam kandidat može pristupiti
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Nemate dozvolu za pristup bedževima' });
  }
  next();
}, getBadges);

// Dodjela bedževa (samo admin)
router.post('/:id/badges', protect, authorize('admin'), addBadge);

module.exports = router;
