const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // koristimo protect
const { sendMessage, getMessages, updateMessageStatus } = require('../controllers/chatController');

// Nova poruka
router.post('/', protect, sendMessage);

// Dohvat poruka za korisnika
router.get('/:userId', protect, getMessages);

// Update statusa poruke (sent, delivered, read)
router.put('/:id/status', protect, updateMessageStatus);

module.exports = router;
