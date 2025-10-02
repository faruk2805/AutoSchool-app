const Question = require('../models/Question');
const User = require('../models/User');
const { updateBadges } = require('./badgeController');

// Kreiranje pitanja (samo admin)
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ message: 'Pitanje dodano', question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dohvat pitanja po tipu
exports.getQuestionsByTip = async (req, res) => {
  try {
    const questions = await Question.find({ tip: req.params.tip });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dohvat kombinovanog testa (sva pitanja)
exports.getCombinedTest = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Kandidat rješava test
exports.submitTest = async (req, res) => {
  try {
    const userId = req.user._id; // Kandidat logovan
    const { odgovori, tip } = req.body; 
    // odgovori = [{ questionId, selectedOptionIndex }]

    const questions = await Question.find({ tip });
    if (questions.length === 0) {
      return res.status(400).json({ message: 'Nema pitanja za ovaj tip' });
    }

    let correctCount = 0;
    const results = [];

    questions.forEach((q) => {
      const answer = odgovori.find(o => o.questionId === q._id.toString());
      let isCorrect = false;
      if (answer !== undefined) {
        const selected = q.opcije[answer.selectedOptionIndex];
        if (selected && selected.correct) isCorrect = true;
      }
      if (isCorrect) correctCount++;
      results.push({ questionId: q._id, correct: isCorrect });
    });

    const score = (correctCount / questions.length) * 100;

    // Update user status
    const user = await User.findById(userId);

    if (tip === 'teorija') {
      user.status.testovi.teorija = score >= 70;
    } else if (tip === 'znak') {
      user.status.testovi.saobracajniZnakovi = score >= 70;
    } else if (tip === 'raskrsnica') {
      user.status.testovi.raskrsnice = score >= 70;
    }

    // Spremi test u completedTests
    user.completedTests.push(...questions.map(q => q._id));

    await user.save();

    // Automatski update bedževa
    await updateBadges(userId);

    res.json({
      message: 'Test riješen',
      score,
      passed: score >= 70,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
