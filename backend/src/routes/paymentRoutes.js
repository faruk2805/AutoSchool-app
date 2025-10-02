const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { addPayment, getPayments } = require('../controllers/paymentController');

// Admin unosi uplatu
router.post('/', protect, authorize('admin'), addPayment);

// Kandidat ili admin pregled uplata
router.get('/users/:id', protect, async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Nemate dozvolu za pregled uplata' });
  }
  next();
}, getPayments);

module.exports = router;
