const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const Question = require("../models/Question");

// Kreiranje pitanja (admin)
router.post("/", questionController.createQuestion);

// ✅ Dohvat svih pitanja po tipu (teorija, znak, raskrsnica, prva_pomoc...)
router.get("/tip/:tip", async (req, res) => {
  try {
    const { tip } = req.params;
    let query = {};

    if (tip === "znak") {
      query = { tip: "znak", slika: { $exists: true, $ne: "" } };
    } else if (tip === "prva_pomoc") {
      query = { kategorija: "prva_pomoc" };
    } else if (tip === "teorija") {
      query = { kategorija: "teorija" };
    } else {
      query = { tip }; 
    }

    const questions = await Question.find(query).sort(
      tip === "znak" ? { tema: 1 } : {}
    );
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions by type:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Dohvat kombinovanog testa (sva pitanja)
router.get("/combined", questionController.getCombinedTest);

// Submit testa i spremanje rezultata
router.post("/submit", questionController.submitTest);

module.exports = router;
