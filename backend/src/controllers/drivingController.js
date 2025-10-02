const User = require('../models/User');
const DrivingSession = require('../models/DrivingSession');
const { updateBadges } = require('./badgeController'); // funkcija za automatski update bedževa

// Dodavanje vožnje kandidatu (samo admin / instruktor)
exports.addDrivingSession = async (req, res) => {
  try {
    const { userId, termin, ocjena, zavrsna = false, napomena } = req.body;

    // Pronađi korisnika
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    // Kreiraj novu vožnju
    const session = await DrivingSession.create({
      user: userId,
      termin,
      ocjena,
      zavrsna,
      napomena
    });

    // Dodaj u user.drivingSessions
    user.drivingSessions.push({
      termin: session._id,
      ocjena,
      napomena
    });

    // Ako je završna vožnja, update status
    if (zavrsna) {
      user.status.voznja.zavrsnaVoznja = true;
    }

    await user.save();

    // Automatski update bedževa
    await updateBadges(userId);

    // Emit notifikacije putem Socket.IO (zakomentarisano, koristi kasnije kada bude globalni io)
    /*
    io.to(userId.toString()).emit('notification', {
      type: 'driving',
      message: `Dodana vožnja: ${ocjena}${zavrsna ? ' (Završna vožnja)' : ''}`
    });
    */

    res.json({ message: 'Vožnja dodana', session });
  } catch (err) {
    console.error('Greška u addDrivingSession:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Dohvat svih vožnji kandidata
exports.getDrivingSessions = async (req, res) => {
  try {
    const userId = req.params.id;

    const sessions = await DrivingSession.find({ user: userId })
      .populate('termin') // ako termin referencira neki DrivingTime model
      .sort({ termin: 1 });

    res.json(sessions);
  } catch (err) {
    console.error('Greška u getDrivingSessions:', err.message);
    res.status(500).json({ message: err.message });
  }
};
