const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createQuestion,
  getQuestionsByTip,
  getCombinedTest,
  submitTest
} = require('../controllers/testController');

// Admin dodaje pitanje
router.post('/', protect, authorize('admin'), createQuestion);

// Dohvat pitanja po tipu
router.get('/tip/:tip', protect, getQuestionsByTip);

// Dohvat kombinovanog testa
router.get('/combined', protect, getCombinedTest);

// Kandidat rješava test
router.post('/submit', protect, submitTest);



module.exports = router;
