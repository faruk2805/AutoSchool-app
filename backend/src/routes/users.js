const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET svi korisnici - samo admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET svoj profil
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('completedTests', 'name')  // popuni naziv testova
      .populate('drivingSessions.termin'); // popuni termine vožnji

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET profil po ID (admin može pregledati sve profile)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('completedTests', 'name')
      .populate('drivingSessions.termin');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE korisnik - samo admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    await user.remove();
    res.json({ message: 'Korisnik obrisan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
