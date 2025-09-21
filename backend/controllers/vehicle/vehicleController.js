const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');
const Document = require('../models/Document');
const fs = require('fs'); // For file system operations

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({});
  res.json(vehicles);
});

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    res.json(vehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, licensePlate } = req.body;

  if (!make || !model || !year || !licensePlate) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const vehicleExists = await Vehicle.findOne({ licensePlate });

  if (vehicleExists) {
    res.status(400);
    throw new Error('Vehicle with this license plate already exists');
  }

  const vehicle = new Vehicle({
    make,
    model,
    year,
    licensePlate,
  });

  const createdVehicle = await vehicle.save();
  res.status(201).json(createdVehicle);
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const { make, model, year, licensePlate } = req.body;

  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    vehicle.make = make || vehicle.make;
    vehicle.model = model || vehicle.model;
    vehicle.year = year || vehicle.year;
    // Check if license plate is being changed and if new one already exists
    if (licensePlate && licensePlate !== vehicle.licensePlate) {
        const licensePlateExists = await Vehicle.findOne({ licensePlate });
        if (licensePlateExists) {
            res.status(400);
            throw new Error('Another vehicle with this license plate already exists');
        }
        vehicle.licensePlate = licensePlate;
    }

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

// @desc    Delete a vehicle and all its associated documents
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (vehicle) {
    // Find all documents associated with the vehicle
    const documents = await Document.find({ vehicle: req.params.id });

    // Delete associated files from the server
    documents.forEach(doc => {
      if (fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath);
      }
    });

    // Delete documents from the database
    await Document.deleteMany({ vehicle: req.params.id });

    // Delete the vehicle
    await vehicle.remove();
    res.json({ message: 'Vehicle and all associated documents removed' });
  } else {
    res.status(404);
    throw new Error('Vehicle not found');
  }
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};