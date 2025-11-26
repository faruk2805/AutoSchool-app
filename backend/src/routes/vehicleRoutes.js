const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const vehicleController = require('../controllers/vehicleController');

// Vozila
router.post('/', protect, authorize('admin', 'instructor'), vehicleController.createVehicle);
router.get('/', protect, authorize('admin', 'instructor'), vehicleController.getVehicles);
router.get('/:id', protect, authorize('admin', 'instructor'), vehicleController.getVehicleById);
router.put('/:id', protect, authorize('admin', 'instructor'), vehicleController.updateVehicle);
router.delete('/:id', protect, authorize('admin', 'instructor'), vehicleController.deleteVehicle);

// Dnevna kilometraža
router.post('/:vehicleId/mileage', protect, authorize('admin', 'instructor'), vehicleController.addMileage);
router.get('/:vehicleId/mileage', protect, authorize('admin', 'instructor'), vehicleController.getMileage);
router.put('/:vehicleId/mileage/:mileageId', protect, authorize('admin', 'instructor'), vehicleController.updateMileage);
router.delete('/:vehicleId/mileage/:mileageId', protect, authorize('admin', 'instructor'), vehicleController.deleteMileage);

module.exports = router;
