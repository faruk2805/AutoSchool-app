const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  zakaziVoznju,
  getDrivingSessions,
  izmijeniVoznju,
  otkaziVoznju,
  otkaziSveZaDan,
  unesiRezultat
} = require('../controllers/drivingController');
const DrivingSession = require('../models/DrivingSession');

// 📌 Kandidat zakazuje vožnju sam sebi
router.post('/zakazi', protect, authorize('candidate'), zakaziVoznju);

// 📌 Dohvat svih vožnji za korisnika (i kao kandidat i kao instruktor)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("🔍 DEBUG - Tražim vožnje za user ID:", userId);
    
    // Provjera autorizacije - samo admin ili vlasnik profila
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Nemate dozvolu za pregled vožnji' });
    }

    const sessions = await DrivingSession.find({
      $or: [
        { kandidat: userId },
        { instruktor: userId }
      ]
    })
    .populate('instruktor', 'name surname email')
    .populate('kandidat', 'name surname email')
    .sort({ datum: 1, vrijeme: 1 });

    console.log("🔍 DEBUG - Pronađeno vožnji:", sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error("❌ Greška u /user/:userId:", error.message);
    res.status(500).json({ message: 'Greška pri dohvatanju vožnji', error: error.message });
  }
});

// 📌 Dohvat vožnji po INSTRUKTORU
router.get('/instruktor/:instruktorId', protect, async (req, res) => {
  try {
    const { instruktorId } = req.params;
    
    console.log("🔍 DEBUG - Tražim vožnje za instruktor ID:", instruktorId);
    
    // Provjera autorizacije - samo admin ili instruktor sam sebi
    if (req.user.role !== 'admin' && req.user._id.toString() !== instruktorId) {
      return res.status(403).json({ message: 'Nemate dozvolu za pregled vožnji' });
    }

    const sessions = await DrivingSession.find({ 
      instruktor: instruktorId 
    })
    .populate('kandidat', 'name surname email')
    .populate('instruktor', 'name surname email')
    .sort({ datum: 1, vrijeme: 1 });

    console.log("🔍 DEBUG - Pronađeno vožnji za instruktora:", sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error("❌ Greška u /instruktor/:instruktorId:", error.message);
    res.status(500).json({ message: 'Greška pri dohvatanju vožnji instruktora', error: error.message });
  }
});

// 📌 Dohvat vožnji po KANDIDATU
router.get('/kandidat/:kandidatId', protect, async (req, res) => {
  try {
    const { kandidatId } = req.params;
    
    console.log("🔍 DEBUG - Tražim vožnje za kandidat ID:", kandidatId);
    
    // Provjera autorizacije - samo admin ili kandidat sam sebi
    if (req.user.role !== 'admin' && req.user._id.toString() !== kandidatId) {
      return res.status(403).json({ message: 'Nemate dozvolu za pregled vožnji' });
    }

    const sessions = await DrivingSession.find({ 
      kandidat: kandidatId 
    })
    .populate('instruktor', 'name surname email')
    .populate('kandidat', 'name surname email')
    .sort({ datum: 1, vrijeme: 1 });

    console.log("🔍 DEBUG - Pronađeno vožnji za kandidata:", sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error("❌ Greška u /kandidat/:kandidatId:", error.message);
    res.status(500).json({ message: 'Greška pri dohvatanju vožnji kandidata', error: error.message });
  }
});

// 📌 Dohvatanje detalja pojedinačne vožnje
router.get('/details/:id', protect, async (req, res) => {
  try {
    const voznja = await DrivingSession.findById(req.params.id)
      .populate('kandidat', 'name surname email')
      .populate('instruktor', 'name surname email');
    
    if (!voznja) {
      return res.status(404).json({ message: 'Vožnja nije pronađena' });
    }

    // Provjera autorizacije - samo kandidat, instruktor ili admin mogu vidjeti detalje
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== voznja.kandidat._id.toString() &&
        req.user._id.toString() !== voznja.instruktor._id.toString()) {
      return res.status(403).json({ message: 'Nemate dozvolu za pregled ove vožnje' });
    }

    res.json(voznja);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dohvatanju detalja vožnje', error: error.message });
  }
});

// 📌 Kandidat otkazuje svoju vožnju
router.put('/otkazi/:id', protect, async (req, res) => {
  try {
    const voznja = await DrivingSession.findById(req.params.id);
    
    if (!voznja) {
      return res.status(404).json({ message: 'Vožnja nije pronađena' });
    }

    // Provjera autorizacije - kandidat, instruktor ili admin mogu otkazati
    const isAuthorized = 
      req.user.role === 'admin' || 
      req.user._id.toString() === voznja.kandidat.toString() ||
      req.user._id.toString() === voznja.instruktor.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Nemate dozvolu za otkazivanje ove vožnje' });
    }

    // Provjera vremena - ne može se otkazati manje od 24h prije vožnje (samo za candidate)
    if (req.user.role === 'candidate') {
      const datumVoznje = new Date(voznja.datum);
      const [sati, minute] = voznja.vrijeme.split(':');
      datumVoznje.setHours(parseInt(sati), parseInt(minute));
      
      const sada = new Date();
      const razlikaSati = (datumVoznje - sada) / (1000 * 60 * 60);
      
      if (razlikaSati < 24) {
        return res.status(400).json({ message: 'Vožnju možete otkazati najkasnije 24 sata prije početka' });
      }
    }

    voznja.status = 'otkazana';
    await voznja.save();

    res.json({ message: 'Vožnja je uspješno otkazana', voznja });
  } catch (error) {
    res.status(500).json({ message: 'Greška pri otkazivanju vožnje', error: error.message });
  }
});

// 📌 Kandidat mijenja svoj termin (do 24h ranije)
router.put('/izmijeni/:id', protect, authorize('candidate'), izmijeniVoznju);

// 📌 Instruktor ili admin dodaje vožnju (za kandidata)
router.post('/', protect, authorize('admin', 'instructor'), zakaziVoznju);

// 📌 Instruktor unosi ocjenu, napomenu, završnu vožnju
router.put('/unesiRezultat/:id', protect, authorize('instructor'), unesiRezultat);

// 📌 Instruktor otkazuje sve vožnje za dan
router.put('/otkaziSveZaDan', protect, authorize('instructor'), otkaziSveZaDan);

module.exports = router;