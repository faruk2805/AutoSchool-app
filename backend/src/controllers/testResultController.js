const TestResult = require('../models/TestResult');
const Question = require('../models/Question');
const { v4: uuidv4 } = require('uuid');

// ============================================================
// ✅ 1. Spremanje rezultata testa
// ============================================================
exports.saveResult = async (req, res) => {
  try {
    console.log('📥 Primljeni podaci za spremanje:', req.body);

    const { userId, tip, subTip = 'lekcijski', odgovori } = req.body;
    if (!userId || !tip || !Array.isArray(odgovori) || odgovori.length === 0) {
      return res.status(400).json({ message: 'Nepotpuni podaci za spremanje testa.' });
    }

    // ISPRAVLJENO: Traži pitanja po OBA polja (tip ILI kategorija)
    const questions = await Question.find({
      $or: [
        { tip: tip },
        { kategorija: tip }
      ]
    });
    
    console.log(`🔍 Pronađeno ${questions.length} pitanja za: ${tip}`);
    console.log(`📊 Struktura: ${questions.filter(q => q.tip).length} po tip, ${questions.filter(q => q.kategorija).length} po kategorija`);
    
    if (questions.length === 0) {
      return res.status(404).json({ message: 'Nema pitanja za ovaj tip testa.' });
    }

    let correctCount = 0;
    const answersWithCorrectness = odgovori.map(ans => {
      const question = questions.find(q => q._id.toString() === ans.questionId.toString());
      if (!question) {
        console.log(`❌ Pitanje nije pronađeno: ${ans.questionId}`);
        return { questionId: ans.questionId, odgovor: ans.odgovor, tacno: false };
      }

      const isCorrect = question.opcije.some(
        opt => opt.text.trim().toLowerCase() === ans.odgovor.trim().toLowerCase() && opt.correct
      );
      if (isCorrect) correctCount++;

      return { questionId: ans.questionId, odgovor: ans.odgovor, tacno: isCorrect };
    });

    const total = odgovori.length;
    const score = total > 0 ? ((correctCount / total) * 100).toFixed(1) : 0;
    const passed = correctCount / total >= 0.7;

    const previousAttempts = await TestResult.countDocuments({ user: userId, tip, subTip });
    const attemptNumber = previousAttempts + 1;

    const newResult = await TestResult.create({
      testId: uuidv4(),
      user: userId,
      tip,
      subTip,
      attemptNumber,
      odgovori: answersWithCorrectness,
      correctCount,
      total,
      score,
      passed
    });

    // ISPRAVLJENO: Populate oba polja
    const populatedResult = await TestResult.findById(newResult._id)
      .populate('user', 'name email')
      .populate('odgovori.questionId', 'pitanje tip kategorija tema opcije');

    console.log('✅ Rezultat uspješno sačuvan:', populatedResult._id);

    res.status(201).json({
      message: 'Rezultat uspješno sačuvan.',
      rezultat: populatedResult
    });

  } catch (err) {
    console.error('❌ Greška prilikom spremanja rezultata:', err);
    res.status(500).json({ message: 'Greška prilikom spremanja rezultata.', error: err.message });
  }
};

// ============================================================
// ✅ 2. Dohvati sve rezultate jednog korisnika
// ============================================================
exports.getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await TestResult.find({ user: userId })
      .populate('user', 'name email')
      .populate('odgovori.questionId', 'pitanje kategorija tema opcije')
      .sort({ createdAt: -1 });

    if (!results.length) {
      return res.status(404).json({ message: 'Korisnik još nije radio nijedan test.' });
    }

    res.status(200).json({
      userId,
      broj_testova: results.length,
      rezultati: results
    });
  } catch (err) {
    console.error('❌ Greška prilikom dohvata rezultata korisnika:', err);
    res.status(500).json({ message: 'Greška prilikom dohvata rezultata korisnika.' });
  }
};

// ============================================================
// ✅ 3. Dohvati rezultate korisnika po tipu i podtipu
// ============================================================
exports.getUserResultsByType = async (req, res) => {
  try {
    const { userId, tip, subTip } = req.params;
    const query = { user: userId };

    if (tip) query.tip = tip;
    if (subTip) query.subTip = subTip;

    const results = await TestResult.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    if (!results.length) {
      return res.status(404).json({ message: 'Nema rezultata za traženi tip testa.' });
    }

    res.status(200).json({
      user: results[0].user,
      tip,
      subTip: subTip || null,
      broj_testova: results.length,
      rezultati: results.map(r => ({
        id: r._id,
        tacno: r.correctCount,
        ukupno: r.total,
        procent: r.score,
        polozen: r.passed,
        datum: r.createdAt
      }))
    });
  } catch (err) {
    console.error('❌ Greška prilikom filtriranja rezultata:', err);
    res.status(500).json({ message: 'Greška prilikom filtriranja rezultata.' });
  }
};

// ============================================================
// ✅ 4. Dohvati sve rezultate (za admina)
// ============================================================
exports.getAllResults = async (req, res) => {
  try {
    const results = await TestResult.find()
      .populate('user', 'name email')
      .populate('odgovori.questionId', 'pitanje kategorija tema opcije')
      .sort({ createdAt: -1 });

    res.status(200).json({
      ukupno_testova: results.length,
      rezultati: results
    });
  } catch (err) {
    console.error('❌ Greška prilikom dohvata svih rezultata:', err);
    res.status(500).json({ message: 'Greška prilikom dohvata svih rezultata.' });
  }
};
