const express = require('express');
const router = express.Router();
const testResultController = require('../controllers/testResultController');
const TestResult = require('../models/TestResult');

// ==========================
// ✅ POST – Spremanje rezultata testa
// Body JSON očekuje: { userId, tip, subTip, odgovori }
// Primjer: POST /api/testresults/save
// ==========================
router.post('/save', testResultController.saveResult);

// ==========================
// ✅ GET – Svi rezultati korisnika
// Primjer: GET /api/testresults/user/68ddb01cebb9729427e99c14
// ==========================
router.get('/user/:userId', testResultController.getUserResults);

// ==========================
// ✅ GET – Rezultati korisnika po tipu
// Primjer: GET /api/testresults/user/68ddb01cebb9729427e99c14/prva_pomoc
// ==========================
router.get('/user/:userId/:tip', async (req, res) => {
  const { userId, tip } = req.params;

  try {
    console.log(`📥 GET rezultati: user=${userId}, tip=${tip}`);

    const results = await TestResult.find({ user: userId, tip })
      .populate('user', 'name email')
      .populate('odgovori.questionId', 'pitanje kategorija tema opcije')
      .sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Nema rezultata za traženi tip.' });
    }

    res.status(200).json({
      userId,
      tip,
      broj_testova: results.length,
      rezultati: results
    });
  } catch (err) {
    console.error('❌ Greška pri dohvatu rezultata po tipu:', err);
    res.status(500).json({ message: 'Greška prilikom dohvata rezultata.', error: err.message });
  }
});

// ==========================
// ✅ GET – Rezultati korisnika po tipu i podtipu
// Primjer: GET /api/testresults/user/68ddb01cebb9729427e99c14/prva_pomoc/lekcijski
// ==========================
router.get('/user/:userId/:tip/:subTip', async (req, res) => {
  const { userId, tip, subTip } = req.params;

  try {
    console.log(`📥 GET kombinacija: user=${userId}, tip=${tip}, subTip=${subTip}`);

    const filter = { user: userId, tip, subTip };

    const results = await TestResult.find(filter)
      .populate('user', 'name email')
      .populate('odgovori.questionId', 'pitanje kategorija tema opcije')
      .sort({ createdAt: -1 });

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Nema rezultata za traženi tip i podtip.' });
    }

    res.status(200).json({
      userId,
      tip,
      subTip,
      broj_testova: results.length,
      rezultati: results
    });
  } catch (err) {
    console.error('❌ Greška pri dohvatu rezultata po tipu i podtipu:', err);
    res.status(500).json({ message: 'Greška prilikom dohvata rezultata.', error: err.message });
  }
});

// ==========================
// ✅ GET – Grupisani rezultati po tipu
// Primjer: GET /api/testresults/user/68ddb01cebb9729427e99c14/byType
// ==========================
router.get('/user/:userId/byType', testResultController.getUserResultsByType);

// ==========================
// ✅ GET – Svi rezultati (za admina)
// Primjer: GET /api/testresults/all
// ==========================
router.get('/all', testResultController.getAllResults);

module.exports = router;
