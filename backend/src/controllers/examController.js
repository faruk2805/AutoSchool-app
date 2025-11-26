const ExamSession = require("../models/ExamSession");
const User = require("../models/User");

/* ---------------------------------- */
/* 🔹 1. Instruktor otvara novi rok   */
/* ---------------------------------- */
exports.createExamSession = async (req, res) => {
  try {
    const { tip, datum, vrijeme, maxKandidata } = req.body;
    const instruktorId = req.user.id;

    // Provjeri da li već postoji rok za taj tip i termin
    const postoji = await ExamSession.findOne({ tip, datum, vrijeme });
    if (postoji) {
      return res.status(400).json({ message: "Rok za taj termin već postoji." });
    }

    const noviRok = await ExamSession.create({
      tip,
      datum,
      vrijeme,
      instruktor: instruktorId,
      maxKandidata: maxKandidata || 10,
    });

    res.status(201).json({
      message: "✅ Rok uspješno otvoren.",
      rok: noviRok,
    });
  } catch (err) {
    console.error("❌ Greška u createExamSession:", err);
    res.status(500).json({ message: "Greška prilikom otvaranja roka." });
  }
};

/* ---------------------------------- */
/* 🔹 2. Kandidat se prijavljuje      */
/* ---------------------------------- */
exports.registerForExam = async (req, res) => {
  try {
    const { sessionId, userId, vrijeme } = req.body;

    if (!sessionId || !userId || !vrijeme) {
      return res.status(400).json({ message: "Nedostaju obavezna polja" });
    }

    const session = await ExamSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Ispitni rok nije pronađen" });
    }

    if (session.prijavljeni.includes(userId)) {
      return res.status(400).json({ message: "Već ste prijavljeni na ovaj ispit" });
    }

    if (session.prijavljeni.length >= session.maxKandidata) {
      return res.status(400).json({ message: "Ispitni rok je popunjen" });
    }

    // ✅ Ovdje postavljamo 'vrijeme' polje jer je required
    session.prijavljeni.push(userId);
    session.vrijeme = new Date(vrijeme).toISOString();

    await session.save();

    return res.status(200).json({ message: "Uspješno prijavljen na ispit" });
  } catch (error) {
    console.error("Greška u registerForExam:", error);
    return res.status(500).json({ message: "Greška prilikom prijave" });
  }
};
/* ---------------------------------- */
/* 🔹 3. Instruktor zatvara rok       */
/* ---------------------------------- */
exports.closeExamSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { rezultati } = req.body;
    // rezultati = [{ kandidatId, prosao, bodovi }]
    
    const rok = await ExamSession.findById(id);
    if (!rok) return res.status(404).json({ message: "Rok ne postoji." });

    for (const r of rezultati) {
      const kandidat = await User.findById(r.kandidatId);
      if (!kandidat) continue;

      // ✅ Ažuriraj status kandidata
      if (r.prosao) {
        if (rok.tip === "teorija") {
          kandidat.status.polozio.teoriju = true;
          if (!kandidat.status.bedzevi.includes("Teorija vožnje")) {
            kandidat.status.bedzevi.push("Teorija vožnje");
          }
        }

        if (rok.tip === "prva_pomoc") {
          kandidat.status.polozio.prvuPomoc = true;
          if (!kandidat.status.bedzevi.includes("Prva pomoć")) {
            kandidat.status.bedzevi.push("Prva pomoć");
          }
        }

        if (rok.tip === "glavna_voznja") {
          kandidat.status.polozio.voznju = true;
          if (!kandidat.status.bedzevi.includes("Glavna vožnja")) {
            kandidat.status.bedzevi.push("Glavna vožnja");
          }
        }

        // ✅ Ako ima sve tri — dodaj “Zlatni kandidat”
        const { teoriju, prvuPomoc, voznju } = kandidat.status.polozio;
        if (teoriju && prvuPomoc && voznju) {
          if (!kandidat.status.bedzevi.includes("Zlatni kandidat")) {
            kandidat.status.bedzevi.push("Zlatni kandidat");
          }
        }

        await kandidat.save();
      }
    }

    rok.status = "zatvoren";
    await rok.save();

    res.json({ message: "✅ Rok uspješno zatvoren i rezultati spremljeni.", rok });
  } catch (err) {
    console.error("❌ Greška u closeExamSession:", err);
    res.status(500).json({ message: "Greška prilikom zatvaranja roka." });
  }
};

/* ---------------------------------- */
/* 🔹 4. Pregled svih otvorenih rokova */
/* ---------------------------------- */
exports.getAllOpenSessions = async (req, res) => {
  try {
    const sessions = await ExamSession.find({ status: "otvoren" }).populate("instruktor", "name surname");
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Vrati otvorene rokove po tipu (prva_pomoc, teorija, glavna_voznja)
exports.getOpenSessionsByType = async (req, res) => {
  try {
    const { tip } = req.params;
    const sessions = await ExamSession.find({ tip, status: "otvoren" }).populate("instruktor", "name surname");
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------------------------- */
/* 🔹 5. (Opcionalno) Ručni unos rezultata */
/* ---------------------------------- */
exports.addExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body;

    const exam = await ExamSession.findById(id);
    if (!exam) return res.status(404).json({ message: "Rok nije pronađen." });

    for (const result of results) {
      const candidate = await User.findById(result.kandidatId);
      if (!candidate) continue;

      switch (exam.tip) {
        case "prva_pomoc":
          if (result.passed) {
            candidate.status.polozio.prvuPomoc = true;
            if (!candidate.status.bedzevi.includes("Prva pomoć"))
              candidate.status.bedzevi.push("Prva pomoć");
          }
          break;

        case "teorija":
          if (result.passed) {
            candidate.status.polozio.teoriju = true;
            if (!candidate.status.bedzevi.includes("Teorija vožnje"))
              candidate.status.bedzevi.push("Teorija vožnje");
          }
          break;

        case "glavna_voznja":
          if (result.passed) {
            candidate.status.polozio.voznju = true;
            if (!candidate.status.bedzevi.includes("Glavna vožnja"))
              candidate.status.bedzevi.push("Glavna vožnja");
          }
          break;
      }

      const { teoriju, prvuPomoc, voznju } = candidate.status.polozio;
      if (teoriju && prvuPomoc && voznju && !candidate.status.bedzevi.includes("Zlatni kandidat")) {
        candidate.status.bedzevi.push("Zlatni kandidat");
      }

      await candidate.save();
    }

    res.status(200).json({ message: "Rezultati i bedževi uspješno ažurirani." });
  } catch (error) {
    console.error("❌ Greška u addExamResult:", error);
    res.status(500).json({ message: "Greška pri unosu rezultata." });
  }
};
exports.getUserExams = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Dohvati sve rokove gdje je kandidat prijavljen
    const sessions = await ExamSession.find({ prijavljeni: userId })
      .populate("instruktor", "name")
      .lean();

    // Za svaki session dodaj rezultat kandidata (ako postoji)
    const sessionsWithResults = sessions.map(session => {
      const userResult = session.rezultati.find(r => r.kandidat.toString() === userId);
      return { ...session, userResult };
    });

    res.json(sessionsWithResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri učitavanju mojih prijava" });
  }
};
