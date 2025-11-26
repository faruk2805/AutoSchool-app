const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

// Sprječava grešku "Cannot overwrite model once compiled"
module.exports = mongoose.models.TestResult || mongoose.model(
  'TestResult',
  new mongoose.Schema({
    // Jedinstveni ID testa (za praćenje pojedinačnih pokušaja)
    testId: { type: String, default: uuidv4, unique: true },

    // Korisnik koji je radio test
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Glavna kategorija testa
    tip: {
      type: String,
      enum: ['teorija', 'znak', 'raskrsnica', 'prva_pomoc'],
      required: true,
    },

    // Dodatni podtip testa (npr. kombinovani / lekcijski)
    subTip: {
      type: String,
      enum: ['kombinovani', 'lekcijski'],
      default: 'lekcijski',
    },

    // Broj pokušaja tog korisnika za određeni tip testa
    attemptNumber: { type: Number, default: 1 },

    // Lista pitanja i korisnikovih odgovora
    odgovori: [
      {
        questionId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Question', 
          required: true 
        },
        odgovor: { type: String, required: true },
        tacno: { type: Boolean, required: true },
      },
    ],

    // Statistika rezultata
    correctCount: { type: Number, required: true },
    total: { type: Number, required: true },
    score: { type: Number }, // procenat, npr. 85
    passed: { type: Boolean, required: true },

    // Vrijeme polaganja
    createdAt: { type: Date, default: Date.now },
  })
);
