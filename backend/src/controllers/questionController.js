const Question = require('../models/Question');
const User = require('../models/User');
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

// Dohvat pitanja po tipu (teorija, znak, raskrsnica)
exports.getQuestionsByTip = async (req, res) => {
  try {
    const { tip } = req.params;
    const questions = await Question.find({ tip });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dohvat kombinovanog testa (npr. za rješavanje kompletnog testa)
exports.getCombinedTest = async (req, res) => {
  try {
    const pitanja = await Question.find(); // svi tipovi
    res.json(pitanja);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rješavanje testa kandidata
exports.submitTest = async (req, res) => {
  try {
    const { userId, tip, odgovori } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Korisnik ne postoji' });

    const questions = await Question.find({ tip });
    let correctCount = 0;

    questions.forEach((q, index) => {
      const answer = odgovori[index];
      const isCorrect = q.opcije.some(opt => opt.text === answer && opt.correct);
      if (isCorrect) correctCount++;
    });

    const passed = correctCount / questions.length >= 0.7;

    if (!user.status.testovi) user.status.testovi = {};
    if (tip === 'teorija') user.status.testovi.teorija = passed;
    if (tip === 'znak') user.status.testovi.saobracajniZnakovi = passed;
    if (tip === 'raskrsnica') user.status.testovi.raskrsnice = passed;

    await updateBadges(user._id);
    await user.save();

    res.json({ correctCount, total: questions.length, passed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
