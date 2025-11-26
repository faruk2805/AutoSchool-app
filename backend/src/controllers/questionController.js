const Question = require('../models/Question');
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const { updateBadges } = require('./badgeController');

// Kreiranje pitanja (admin)
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dohvat pitanja po tipu/kategoriji (teorija, znak, raskrsnica, prva_pomoc)
exports.getQuestionsByTip = async (req, res) => {
  try {
    const { tip } = req.params; // npr. 'prva_pomoc'
    const questions = await Question.find({ kategorija: tip });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dohvat svih pitanja (kombinovani test)
exports.getCombinedTest = async (req, res) => {
  try {
    const pitanja = await Question.find();
    res.json(pitanja);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rješavanje testa kandidata i spremanje rezultata
exports.submitTest = async (req, res) => {
  try {
    const { userId, tip, odgovori } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    const questions = await Question.find({ kategorija: tip }); // koristi polje kategorija
    let correctCount = 0;

    const answersWithCorrectness = questions.map((q, i) => {
      const answer = odgovori[i];
      const isCorrect = q.opcije.some(opt => opt.text === answer && opt.correct);
      if (isCorrect) correctCount++;
      return {
        questionId: q._id,
        answer,
        correct: isCorrect
      };
    });

    const passed = questions.length > 0 ? correctCount / questions.length >= 0.7 : false;

    // Snimi rezultat u TestResult kolekciju
    const testResult = await TestResult.create({
      user: user._id,
      tip,
      odgovori: answersWithCorrectness,
      correctCount,
      total: questions.length,
      passed
    });

    // Update status korisnika po tipu testa
    if (!user.status) user.status = {};
    if (!user.status.testovi) user.status.testovi = {};

    switch (tip) {
      case 'teorija':
        user.status.testovi.teorija = passed;
        break;
      case 'znak':
        user.status.testovi.saobracajniZnakovi = passed;
        break;
      case 'raskrsnica':
        user.status.testovi.raskrsnice = passed;
        break;
      case 'prva_pomoc':
        user.status.testovi.prvaPomoc = passed;
        break;
      default:
        break;
    }

    // Update eventualnih bedževa
    await updateBadges(user._id);

    // Spremi korisnika
    await user.save();

    // Vrati rezultat frontendu
    res.json({
      correctCount,
      total: questions.length,
      passed,
      testResultId: testResult._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
