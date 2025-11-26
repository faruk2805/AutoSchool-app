const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/instruktori', protect, authorize('admin', 'instructor', 'candidate'), async (req, res) => {
  try {
    const instruktori = await User.find({ role: 'instructor' }).select('-password');
    res.json(instruktori);
  } catch (err) {
    res.status(500).json({ message: 'Greška na serveru' });
  }
});


// 🔹 GET svi korisnici – samo admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 GET kandidati za instruktora – samo instruktor može vidjeti svoje kandidate
router.get('/my-candidates', protect, authorize('instructor'), async (req, res) => {
  try {
    const instructorId = req.user._id;
    
    const candidates = await User.find({ 
      role: 'candidate',
      instruktor: instructorId 
    }).select('-password');
    
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// 🔹 GET svoj profil (kandidat, instruktor ili admin)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('instruktor', 'name surname email')
      .populate('drivingSessions.termin');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔹 GET korisnik po ID – samo admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('instruktor', 'name surname email')
      .populate('drivingSessions.termin');

    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔹 Dodjela instruktora kandidatu – samo admin
router.put('/:candidateId/assign-instructor/:instructorId', protect, authorize('admin'), async (req, res) => {
  try {
    const kandidat = await User.findById(req.params.candidateId);
    const instruktor = await User.findById(req.params.instructorId);

    if (!kandidat || !instruktor) {
      return res.status(404).json({ message: 'Kandidat ili instruktor nisu pronađeni' });
    }

    if (instruktor.role !== 'instructor') {
      return res.status(400).json({ message: 'Odabrani korisnik nije instruktor' });
    }

    kandidat.instruktor = instruktor._id;
    await kandidat.save();

    res.json({ message: 'Instruktor uspješno dodijeljen kandidatu', kandidat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});


// 🔹 Ažuriranje statusa položenih dijelova obuke – admin ili instruktor
router.put('/:id/update-status', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const { teorija, prvaPomoc, voznja } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Kandidat nije pronađen' });

    // Ažuriraj samo ono što je poslano
    if (teorija !== undefined) user.status.polozio.teoriju = teorija;
    if (prvaPomoc !== undefined) user.status.polozio.prvuPomoc = prvaPomoc;
    if (voznja !== undefined) user.status.polozio.voznju = voznja;

    await user.save();
    res.json({ message: 'Status uspješno ažuriran', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});


// 🔹 DELETE korisnik – samo admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    await user.deleteOne();
    res.json({ message: 'Korisnik obrisan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔹 Kreiranje novog korisnika – samo admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, surname, email, password, jmbg, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Korisnik već postoji' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      jmbg,
      role
    });

    res.status(201).json({ message: 'Korisnik uspješno kreiran', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
