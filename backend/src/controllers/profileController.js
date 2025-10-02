const User = require('../models/User');
const { updateBadges } = require('./badgeController');

// Dohvat profila kandidata
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('completedTests')
      .populate('drivingSessions.termin');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profila kandidata
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    // AUTOMATSKO ažuriranje bedževa nakon svakog update-a
    const badges = await updateBadges(user._id);
    user.status.bedzevi = badges;

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
