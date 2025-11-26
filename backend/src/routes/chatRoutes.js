const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  sendMessage, 
  getUserMessages, 
  getConversations, 
  updateMessageStatus,
  getCandidates  
} = require('../controllers/chatController');

// Nova poruka
router.post('/', protect, sendMessage);

// Dohvat poruka između dva korisnika
router.get('/conversation/:userId', protect, getUserMessages);

// Dohvat svih konverzacija
router.get('/conversations', protect, getConversations);

// Dohvat kandidata za instruktora
router.get('/candidates', protect, getCandidates);  // DODAJ OVU RUTU

// Update statusa poruke
router.put('/:id/status', protect, updateMessageStatus);

module.exports = router;