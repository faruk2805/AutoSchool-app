const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Osnovni podaci
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  jmbg: { type: String, required: true },
  role: { type: String, enum: ["candidate", "instructor", "admin"], default: "candidate" },

  // 🔹 Povezan instruktor (ako postoji)
  instruktor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Napredak kroz obuku
  status: {
    teorijaPrvaPomoc: { type: Boolean, default: false },
    voznja: {
      brojVoznji: { type: Number, default: 0 },
      ocjene: [{ type: String }],
      zavrsnaVoznja: { type: Boolean, default: false }
    },
    polozio: {
      teoriju: { type: Boolean, default: false },
      prvuPomoc: { type: Boolean, default: false },
      voznju: { type: Boolean, default: false }
    },
    bedzevi: [{ type: String }]
  },

  drivingSessions: [
    {
      termin: { type: mongoose.Schema.Types.ObjectId, ref: 'DrivingTime' },
      ocjena: { type: Number },
      napomena: { type: String }
    }
  ],

  recommendations: [{ type: String }],

  documents: {
    idCard: { type: String },
    medical: { type: String },
    consents: [{ type: String }]
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
