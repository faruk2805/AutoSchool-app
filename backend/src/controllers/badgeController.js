const User = require('../models/User');

// Dohvat bedževa kandidata
exports.getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('status');
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    res.json({ badges: user.status.bedzevi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ručna dodjela bedža kandidatu
exports.addBadge = async (req, res) => {
  try {
    const { badge } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    if (!user.status.bedzevi.includes(badge)) {
      user.status.bedzevi.push(badge);
      await user.save();
    }

    res.json({ message: 'Bedž dodan', badges: user.status.bedzevi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Automatsko ažuriranje bedževa na osnovu statusa kandidata
exports.updateBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const bedzevi = new Set(user.status.bedzevi || []);

    // Bedž: prva pomoć
    if (user.status.teorijaPrvaPomoc) bedzevi.add('prva_pomoc');

    // Bedž: svi testovi polozeni
    const testovi = user.status.testovi || {};
    if (testovi.teorija && testovi.saobracajniZnakovi && testovi.raskrsnice) {
      bedzevi.add('testovi_polozeni');
    }

    // Bedž: završna vožnja
    if (user.status.voznja?.zavrsnaVoznja) bedzevi.add('zavrsna_voznja');

    user.status.bedzevi = Array.from(bedzevi);
    await user.save();

    return user.status.bedzevi;
  } catch (err) {
    console.error('Greška pri update bedževa:', err.message);
  }
};
