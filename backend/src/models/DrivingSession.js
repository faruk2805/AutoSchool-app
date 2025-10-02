// models/DrivingSession.js
const mongoose = require('mongoose');

const drivingSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  termin: { type: Date, required: true },
  ocjena: { type: String, enum: ['nedovoljan', 'dovoljan', 'dobar', 'odlican'], default: 'dovoljan' },
  napomena: { type: String },
  zavrsna: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("DrivingSession", drivingSessionSchema);
