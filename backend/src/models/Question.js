const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  tip: { 
    type: String, 
    enum: ['teorija', 'znak', 'raskrsnica'], 
    required: true 
  }, 
  tema: { type: String }, 
  pitanje: { type: String, required: true },
  opcije: [{ text: String, correct: Boolean }],
  slika: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
