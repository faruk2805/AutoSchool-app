const mongoose = require("mongoose");

const examSessionSchema = new mongoose.Schema(
  {
    // 🔹 Tip ispita
    tip: {
      type: String,
      enum: ["prva_pomoc", "teorija", "glavna_voznja"],
      required: true,
    },

    // 📅 Datum i vrijeme ispita
    datum: { type: Date, required: true },
    vrijeme: { type: String, required: true },

    // 👨‍🏫 Instruktor koji je otvorio rok
    instruktor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👥 Kandidati prijavljeni na rok
    prijavljeni: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🧾 Rezultati ispita
    rezultati: [
      {
        kandidat: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        prosao: { type: Boolean, default: false },
        bodovi: { type: Number, default: 0 },
        napomena: { type: String, default: "" },
      },
    ],

    // 🔒 Status roka (aktivan ili završen)
    status: {
      type: String,
      enum: ["otvoren", "zatvoren"],
      default: "otvoren",
    },

    // 🎯 Maksimalan broj kandidata (opciono)
    maxKandidata: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamSession", examSessionSchema);
