const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createExamSession,
  registerForExam,
  closeExamSession,
  getAllOpenSessions,
  getOpenSessionsByType,
  addExamResult,
} = require("../controllers/examController");

// 🔹 Instruktor kreira novi ispitni rok
router.post("/create", protect, authorize("instructor", "admin"), createExamSession);

// 🔹 Kandidat se prijavljuje na ispit
router.post("/register", protect, authorize("candidate"), registerForExam);

// 🔹 Instruktor zatvara ispitni rok
router.put("/close/:id", protect, authorize("instructor", "admin"), closeExamSession);

// 🔹 Instruktor dodaje rezultate kandidata
router.put("/result/:id", protect, authorize("instructor", "admin"), addExamResult);

// 🔹 Pregled svih otvorenih rokova (za sve tipove)
router.get("/open", protect, getAllOpenSessions);

// 🔹 Pregled otvorenih rokova po tipu (npr. teorija, prva_pomoc, glavna_voznja)
router.get("/open/:tip", protect, getOpenSessionsByType);

module.exports = router;
