const User = require("../models/User");
const DrivingSession = require("../models/DrivingSession");
const { updateBadges } = require("./badgeController");

// 📅 Zakazivanje vožnje od strane kandidata
exports.zakaziVoznju = async (req, res) => {
  try {
    const { kandidatId, instruktorId, datum, vrijeme } = req.body;

    const kandidat = await User.findById(kandidatId);
    const instruktor = await User.findById(instruktorId);

    if (!kandidat || !instruktor)
      return res.status(404).json({ message: "Kandidat ili instruktor ne postoji" });

    // Provjeri da li je vrijeme unutar 8–20
    const hour = parseInt(vrijeme.split(":")[0]);
    if (hour < 8 || hour > 20)
      return res.status(400).json({ message: "Vrijeme mora biti između 08:00 i 20:00" });

    // Provjera da li je termin slobodan za instruktora
    const postoji = await DrivingSession.findOne({ instruktor: instruktorId, datum, vrijeme });
    if (postoji)
      return res.status(400).json({ message: "Termin je već zauzet za ovog instruktora" });

    // Provjera noćnih vožnji (17–20)
    const nocna = hour >= 17;
    if (nocna) {
      const brojNocnih = await DrivingSession.countDocuments({ kandidat: kandidatId, nocna: true });
      if (brojNocnih >= 3)
        return res.status(400).json({ message: "Dopuštene su najviše 3 noćne vožnje" });
    }

    const novaVoznja = await DrivingSession.create({
      kandidat: kandidatId,
      instruktor: instruktorId,
      datum,
      vrijeme,
      nocna,
      status: "zakazana"
    });

    res.status(201).json({ message: "Vožnja uspješno zakazana", voznja: novaVoznja });
  } catch (err) {
    console.error("Greška u zakaziVoznju:", err.message);
    res.status(500).json({ message: "Greška prilikom zakazivanja vožnje" });
  }
};

// ⏰ Izmjena termina (do 24h ranije)
exports.izmijeniVoznju = async (req, res) => {
  try {
    const { id } = req.params;
    const { noviDatum, novoVrijeme } = req.body;

    const voznja = await DrivingSession.findById(id);
    if (!voznja) return res.status(404).json({ message: "Vožnja ne postoji" });

    // Provjeri razliku vremena
    const sad = new Date();
    const diff = (new Date(voznja.datum) - sad) / (1000 * 60 * 60);
    if (diff < 24)
      return res.status(400).json({ message: "Izmjena je moguća samo do 24h prije vožnje" });

    voznja.datum = noviDatum;
    voznja.vrijeme = novoVrijeme;
    voznja.nocna = parseInt(novoVrijeme.split(":")[0]) >= 17;

    await voznja.save();

    res.json({ message: "Termin vožnje ažuriran", voznja });
  } catch (err) {
    console.error("Greška u izmijeniVoznju:", err.message);
    res.status(500).json({ message: "Greška prilikom izmjene vožnje" });
  }
};

// ❌ Otkazivanje vožnje (instruktor)
exports.otkaziVoznju = async (req, res) => {
  try {
    const { id } = req.params;

    const voznja = await DrivingSession.findById(id);
    if (!voznja) return res.status(404).json({ message: "Vožnja ne postoji" });

    voznja.status = "otkazana";
    await voznja.save();

    res.json({ message: "Vožnja je otkazana" });
  } catch (err) {
    console.error("Greška u otkaziVoznju:", err.message);
    res.status(500).json({ message: "Greška prilikom otkazivanja" });
  }
};

// ❌ Otkazivanje svih vožnji za dan (instruktor)
exports.otkaziSveZaDan = async (req, res) => {
  try {
    const { instruktorId, datum } = req.body;

    await DrivingSession.updateMany(
      { instruktor: instruktorId, datum },
      { $set: { status: "otkazana" } }
    );

    res.json({ message: "Sve vožnje za taj dan su otkazane" });
  } catch (err) {
    console.error("Greška u otkaziSveZaDan:", err.message);
    res.status(500).json({ message: "Greška prilikom otkazivanja vožnji za dan" });
  }
};

// 🧾 Unos ocjene, napomene i završne vožnje (instruktor)
exports.unesiRezultat = async (req, res) => {
  try {
    const { id } = req.params;
    const { ocjena, napomena, zavrsna } = req.body;

    const voznja = await DrivingSession.findById(id);
    if (!voznja) return res.status(404).json({ message: "Vožnja ne postoji" });

    voznja.ocjena = ocjena;
    voznja.napomena = napomena;
    voznja.zavrsna = zavrsna;
    voznja.status = "zavrsena";

    await voznja.save();

    // 🔹 Ako je označeno da je završna vožnja — ažuriraj korisnika i dodaj bedž
    if (zavrsna) {
      const kandidat = await User.findById(voznja.kandidat);
      if (kandidat) {
        kandidat.status.voznja.zavrsnaVoznja = true;
        kandidat.status.polozio.voznju = true;
        await kandidat.save();

        // Automatski dodaj bedž "zavrsna_voznja"
        await updateBadges(kandidat._id);
      }
    }

    res.json({ message: "Podaci o vožnji su uneseni", voznja });
  } catch (err) {
    console.error("Greška u unesiRezultat:", err.message);
    res.status(500).json({ message: "Greška prilikom unosa rezultata" });
  }
};

// 📋 Pregled vožnji (kandidat ili instruktor)
exports.getDrivingSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // DEBUG: Ispišite što primate
    console.log("🔍 DEBUG - Tražim vožnje za userId:", userId);
    console.log("🔍 DEBUG - Tip userId:", typeof userId);

    // Provjerite da li userId postoji
    if (!userId) {
      return res.status(400).json({ message: "userId je obavezan" });
    }

    const voznje = await DrivingSession.find({
      $or: [
        { kandidat: userId }, 
        { instruktor: userId }
      ]
    })
      .populate("kandidat", "name surname email")
      .populate("instruktor", "name surname email")
      .sort({ datum: 1, vrijeme: 1 });

    // DEBUG: Ispišite rezultate
    console.log("🔍 DEBUG - Pronađeno vožnji:", voznje.length);
    console.log("🔍 DEBUG - Vožnje:", voznje);

    res.json(voznje);
  } catch (err) {
    console.error("❌ Greška u getDrivingSessions:", err.message);
    res.status(500).json({ message: "Greška prilikom dohvaćanja vožnji" });
  }
};
