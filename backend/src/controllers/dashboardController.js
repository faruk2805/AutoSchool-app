const User = require('../models/User');
const DrivingSession = require('../models/DrivingSession');

// Pregled statistike kandidata (samo admin)
exports.getCandidateStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select('name email status completedTests drivingSessions');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    // Statistika testova
    const testovi = {
      teorija: user.status.testovi.teorija || false,
      znakovi: user.status.testovi.saobracajniZnakovi || false,
      raskrsnice: user.status.testovi.raskrsnice || false,
      ukupnoRijeseno: user.completedTests.length
    };

    // Statistika vožnji
    const voznje = {
      ukupno: user.drivingSessions.length,
      zavrsnaVoznja: user.status.voznja.zavrsnaVoznja || false
    };

    // Bedževi
    const bedzevi = user.status.bedzevi || [];

    res.json({
      kandidat: {
        name: user.name,
        email: user.email
      },
      testovi,
      voznje,
      bedzevi
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pregled statistike svih kandidata (samo admin)
exports.getAllCandidatesStats = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email status completedTests drivingSessions');

    const stats = users.map(user => ({
      kandidat: {
        name: user.name,
        email: user.email
      },
      testovi: {
        teorija: user.status.testovi.teorija || false,
        znakovi: user.status.testovi.saobracajniZnakovi || false,
        raskrsnice: user.status.testovi.raskrsnice || false,
        ukupnoRijeseno: user.completedTests.length
      },
      voznje: {
        ukupno: user.drivingSessions.length,
        zavrsnaVoznja: user.status.voznja.zavrsnaVoznja || false
      },
      bedzevi: user.status.bedzevi || []
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
