const express = require('express');
const router = express.Router();
const {
  upload, // Multer middleware
  registerVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

// Define routes
router.route('/')
  .post(upload.single('vehiclePhoto'), registerVehicle) // 'vehiclePhoto' is the field name for the file
  .get(getVehicles);

router.route('/:id')
  .get(getVehicleById)
  .put(upload.single('vehiclePhoto'), updateVehicle) // Allow photo update
  .delete(deleteVehicle);

module.exports = router;