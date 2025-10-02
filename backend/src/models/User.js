const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Osnovni podaci
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  jmbg: { type: String, required: true },
  role: { type: String, enum: ["candidate", "instructor", "admin"], default: "candidate" },

  // Napredak kroz obuku
  status: {
    teorijaPrvaPomoc: { type: Boolean, default: false },
    testovi: {
      teorija: { type: Boolean, default: false },
      saobracajniZnakovi: { type: Boolean, default: false },
      raskrsnice: { type: Boolean, default: false }
    },
    voznja: {
      brojVoznji: { type: Number, default: 0 },
      ocjene: [{ type: String }], // npr. "dobar", "odlican"
      zavrsnaVoznja: { type: Boolean, default: false }
    },
    bedzevi: [{ type: String }] // Gamifikacija
  },

  // Završeni testovi
  completedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],

  // Vožnje sa ocjenama i napomenama
  drivingSessions: [
    {
      termin: { type: mongoose.Schema.Types.ObjectId, ref: 'DrivingTime' },
      ocjena: { type: Number },
      napomena: { type: String }
    }
  ],

  // Preporuke za učenje
  recommendations: [{ type: String }], 

  // Dokumentacija kandidata
  documents: {
    idCard: { type: String },
    medical: { type: String },
    consents: [{ type: String }]
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
