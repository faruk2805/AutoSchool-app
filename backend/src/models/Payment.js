const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // koliko je uplaćeno
  date: { type: Date, default: Date.now },
  purpose: { type: String }, // npr. "prva rata", "druga rata", "puni iznos"
  confirmed: { type: Boolean, default: true } // admin može označiti potvrdu
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
