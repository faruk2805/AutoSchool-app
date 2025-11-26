const mongoose = require("mongoose");

const drivingSessionSchema = new mongoose.Schema(
  {
    kandidat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instruktor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Datum i vrijeme vožnje
    datum: {
      type: Date,
      required: true,
    },
    // Satnica vožnje (08-16 normalna, 17-20 noćna)
    vrijeme: {
      type: String,
      required: true,
      enum: [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ],
    },
    // Da li je noćna vožnja (kandidat smije max 3)
    nocna: {
      type: Boolean,
      default: false,
    },
    // Status vožnje (zakazana, otkazana, završena)
    status: {
      type: String,
      enum: ["zakazana", "otkazana", "zavrsena"],
      default: "zakazana",
    },
    // Ocjena vožnje (instruktor unosi)
    ocjena: {
      type: String,
      enum: ["nedovoljan", "dovoljan", "dobar", "odlican"],
      default: "dovoljan",
    },
    // Napomena instruktora
    napomena: {
      type: String,
      default: "",
    },
    // Završna vožnja (označava kraj obuke)
    zavrsna: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Sprječava duplo zakazivanje istog termina za istog instruktora
drivingSessionSchema.index({ instruktor: 1, datum: 1, vrijeme: 1 }, { unique: true });

module.exports = mongoose.model("DrivingSession", drivingSessionSchema);
