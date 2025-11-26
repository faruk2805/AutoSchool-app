const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET svoj profil (sve osim passworda)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password') // izuzmi password
      .populate('instruktor', 'name surname email')
      .populate('drivingSessions.termin');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    // 🔹 Dodatno strukturiran odgovor
    const response = {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      instruktor: user.instruktor,
      status: {
        teorijaPrvaPomoc: user.status?.teorijaPrvaPomoc,
        voznja: user.status?.voznja,
        polozio: {
          teoriju: user.status?.polozio?.teoriju || false,
          prvuPomoc: user.status?.polozio?.prvuPomoc || false,
          voznju: user.status?.polozio?.voznju || false
        },
        bedzevi: user.status?.bedzevi || []
      },
      drivingSessions: user.drivingSessions,
      recommendations: user.recommendations,
      documents: user.documents,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET korisnik po ID (za admina)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('instruktor', 'name surname email')
      .populate('drivingSessions.termin');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    const response = {
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      instruktor: user.instruktor,
      status: {
        teorijaPrvaPomoc: user.status?.teorijaPrvaPomoc,
        voznja: user.status?.voznja,
        polozio: {
          teoriju: user.status?.polozio?.teoriju || false,
          prvuPomoc: user.status?.polozio?.prvuPomoc || false,
          voznju: user.status?.polozio?.voznju || false
        },
        bedzevi: user.status?.bedzevi || []
      },
      drivingSessions: user.drivingSessions,
      recommendations: user.recommendations,
      documents: user.documents,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
