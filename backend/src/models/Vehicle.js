// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },      // proizvođač
  model: { type: String, required: true },     // model
  plate: { type: String, required: true, unique: true }, // registarski broj
  year: Number,
  currentOdometer: { type: Number, default: 0 }, // trenutna kilometraža
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
