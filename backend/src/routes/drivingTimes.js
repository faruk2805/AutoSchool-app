const express = require('express');
const router = express.Router();
const DrivingTime = require('../models/DrivingTime');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Kreiranje termina ručno
router.post('/', protect, authorize('admin', 'instruktor'), async (req, res) => {
  const termin = await DrivingTime.create(req.body);
  res.status(201).json(termin);
});
// Kandidat sam zakazuje vožnju
router.post('/book', protect, authorize('kandidat'), async (req, res) => {
  try {
    const { instruktorId, datum, vrijemePocetka, vrijemeZavrsetka } = req.body;

    const noviTermin = await DrivingTime.create({
      kandidat: req.user._id,
      instruktor: instruktorId,
      datum,
      vrijemePocetka,
      vrijemeZavrsetka,
      status: 'zakazan'
    });

    res.status(201).json(noviTermin);
  } catch (error) {
    res.status(400).json({ message: 'Greška pri zakazivanju termina', error: error.message });
  }
});

// Automatsko generisanje termina
router.post('/schedule', protect, authorize('admin'), async (req, res) => {
  const { kandidatId, dostupniDani } = req.body;

  // Dohvati instruktore koji su slobodni u tim danima
  const instruktori = await User.find({ role: 'instruktor' });
  
  const termini = dostupniDani.map((datum, i) => ({
    kandidat: kandidatId,
    instruktor: instruktori[i % instruktori.length]._id,
    datum,
    status: 'zakazan'
  }));

  const kreiraniTermini = await DrivingTime.insertMany(termini);
  res.json(kreiraniTermini);
});

// Dohvat termina po kandidatu
router.get('/kandidat/:id', protect, async (req, res) => {
  const termini = await DrivingTime.find({ kandidat: req.params.id }).populate('instruktor', 'name');
  res.json(termini);
});

// Update termina (ocjena, napomena)
router.put('/:id', protect, authorize('admin', 'instruktor'), async (req, res) => {
  const termin = await DrivingTime.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(termin);
});

// Brisanje termina
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await DrivingTime.findByIdAndDelete(req.params.id);
  res.json({ message: 'Termin obrisan' });
});
// Dohvat termina po INSTRUKTORU
router.get('/instruktor/:id', protect, async (req, res) => {
  try {
    const termini = await DrivingTime.find({ 
      instruktor: req.params.id 
    })
    .populate('kandidat', 'name surname email')
    .populate('instruktor', 'name surname email')
    .sort({ datum: 1, vrijemePocetka: 1 });
    
    res.json(termini);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dohvatanju termina', error: error.message });
  }
});

module.exports = router;
