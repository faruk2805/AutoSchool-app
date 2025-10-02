const mongoose = require('mongoose');

const drivingTimeSchema = new mongoose.Schema({
  kandidat: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instruktor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  datum: { type: Date, required: true },
  ocjena: { type: Number, min: 1, max: 5 },
  napomena: { type: String },
  status: { type: String, enum: ['zakazan', 'odrzan', 'otkazan'], default: 'zakazan' }
}, { timestamps: true });

module.exports = mongoose.model('DrivingTime', drivingTimeSchema);
