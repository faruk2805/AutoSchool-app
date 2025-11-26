// models/DailyMileage.js
const mongoose = require('mongoose');

const dailyMileageSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  date: { type: Date, required: true },
  startOdometer: Number,
  endOdometer: { type: Number, required: true },
  distance: Number,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // instruktor koji je unosio
  notes: String
}, { timestamps: true });

// automatski računa distance ako su start i end postavljeni
dailyMileageSchema.pre('save', function(next) {
  if (this.startOdometer != null && this.endOdometer != null) {
    this.distance = this.endOdometer - this.startOdometer;
  }
  next();
});

module.exports = mongoose.model('DailyMileage', dailyMileageSchema);
