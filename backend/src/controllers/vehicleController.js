const Vehicle = require('../models/Vehicle');
const DailyMileage = require('../models/DailyMileage');
const User = require('../models/User');

// 🔹 Kreiranje vozila (instruktor ili admin)
exports.createVehicle = async (req, res) => {
  try {
    const { make, model, plate, year, instructor } = req.body;
    const instructorId = req.user.role === 'instructor' ? req.user._id : instructor;

    const instructorObj = await User.findById(instructorId);
    if (!instructorObj || instructorObj.role !== 'instructor') {
      return res.status(400).json({ message: 'Odabrani korisnik nije instruktor' });
    }

    const vehicleExists = await Vehicle.findOne({ plate });
    if (vehicleExists) return res.status(400).json({ message: 'Vozilo sa ovom registracijom već postoji' });

    const vehicle = await Vehicle.create({ instructor: instructorId, make, model, plate, year });
    res.status(201).json({ message: 'Vozilo kreirano', vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Pregled svih vozila (sa opcijama filtera)
exports.getVehicles = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'instructor') filter.instructor = req.user._id;
    if (req.query.instructor) filter.instructor = req.query.instructor;

    const vehicles = await Vehicle.find(filter).populate('instructor', 'name surname email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Pregled jednog vozila po ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('instructor', 'name surname email');
    if (!vehicle) return res.status(404).json({ message: 'Vozilo ne postoji' });

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Ažuriranje vozila (admin ili instruktor vlasnik)
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vozilo ne postoji' });

    if (req.user.role === 'instructor' && !vehicle.instructor.equals(req.user._id)) {
      return res.status(403).json({ message: 'Nemate pravo uređivanja ovog vozila' });
    }

    const updates = ['make', 'model', 'plate', 'year', 'currentOdometer', 'notes'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) vehicle[field] = req.body[field];
    });

    await vehicle.save();
    res.json({ message: 'Vozilo ažurirano', vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Brisanje vozila
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vozilo ne postoji' });

    if (req.user.role === 'instructor' && !vehicle.instructor.equals(req.user._id)) {
      return res.status(403).json({ message: 'Nemate pravo brisanja ovog vozila' });
    }

    await vehicle.deleteOne();
    res.json({ message: 'Vozilo obrisano' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Dodavanje dnevne kilometraže
exports.addMileage = async (req, res) => {
  try {
    const { startOdometer, endOdometer, notes, date } = req.body;
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vozilo ne postoji' });

    if (req.user.role === 'instructor' && !vehicle.instructor.equals(req.user._id)) {
      return res.status(403).json({ message: 'Nemate pravo unosa kilometraže za ovo vozilo' });
    }

    const mileage = await DailyMileage.create({
      vehicle: vehicle._id,
      startOdometer,
      endOdometer,
      notes,
      date,
      enteredBy: req.user._id
    });

    // ažuriraj currentOdometer ako je veći
    if (endOdometer > vehicle.currentOdometer) {
      vehicle.currentOdometer = endOdometer;
      await vehicle.save();
    }

    res.status(201).json({ message: 'Kilometraža unesena', mileage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Pregled dnevne kilometraže (filter po datumu ili rasponu)
exports.getMileage = async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = { vehicle: req.params.vehicleId };

    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    const mileages = await DailyMileage.find(filter)
      .populate('enteredBy', 'name surname email')
      .sort({ date: -1 });

    res.json(mileages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Ažuriranje dnevne kilometraže
exports.updateMileage = async (req, res) => {
  try {
    const mileage = await DailyMileage.findById(req.params.mileageId);
    if (!mileage) return res.status(404).json({ message: 'Unos kilometraže ne postoji' });

    const vehicle = await Vehicle.findById(mileage.vehicle);
    if (req.user.role === 'instructor' && !vehicle.instructor.equals(req.user._id)) {
      return res.status(403).json({ message: 'Nemate pravo uređivanja ovog unosa' });
    }

    const updates = ['startOdometer', 'endOdometer', 'notes', 'date'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) mileage[field] = req.body[field];
    });

    // ponovo izračunaj distance
    if (mileage.startOdometer != null && mileage.endOdometer != null) {
      mileage.distance = mileage.endOdometer - mileage.startOdometer;
    }

    await mileage.save();

    // ažuriraj currentOdometer vozila
    const maxEnd = await DailyMileage.find({ vehicle: vehicle._id }).sort({ endOdometer: -1 }).limit(1);
    if (maxEnd.length) vehicle.currentOdometer = maxEnd[0].endOdometer;
    await vehicle.save();

    res.json({ message: 'Unos kilometraže ažuriran', mileage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Brisanje dnevne kilometraže
exports.deleteMileage = async (req, res) => {
  try {
    const mileage = await DailyMileage.findById(req.params.mileageId);
    if (!mileage) return res.status(404).json({ message: 'Unos kilometraže ne postoji' });

    const vehicle = await Vehicle.findById(mileage.vehicle);
    if (req.user.role === 'instructor' && !vehicle.instructor.equals(req.user._id)) {
      return res.status(403).json({ message: 'Nemate pravo brisanja ovog unosa' });
    }

    await mileage.deleteOne();

    // ažuriraj currentOdometer vozila
    const maxEnd = await DailyMileage.find({ vehicle: vehicle._id }).sort({ endOdometer: -1 }).limit(1);
    vehicle.currentOdometer = maxEnd.length ? maxEnd[0].endOdometer : 0;
    await vehicle.save();

    res.json({ message: 'Unos kilometraže obrisan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
