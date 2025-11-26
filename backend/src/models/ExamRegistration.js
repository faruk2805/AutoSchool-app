const ExamRegistration = require("../models/examRegistration");

const updateExamResult = async (req, res) => {
  const { registrationId, status, bodovi } = req.body;

  try {
    // Pronađi prijavu
    const registration = await ExamRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: "Prijava nije pronađena" });
    }

    // Update statusa
    registration.status = status; // "polozio" ili "pao"
    registration.bodovi = bodovi || 0; // ako želiš pratiti bodove
    await registration.save();

    res.json({ message: "Rezultat uspješno unesen", registration });
  } catch (error) {
    console.error("Greška pri unosu rezultata:", error);
    res.status(500).json({ message: "Došlo je do greške" });
  }
};
