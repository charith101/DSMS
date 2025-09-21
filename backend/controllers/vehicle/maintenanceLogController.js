const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// @route   GET /api/maintenance-logs
// @desc    Get all maintenance logs
// @access  Public
exports.getAllMaintenanceLogs = async (req, res) => {
  try {
    const maintenanceLogs = await MaintenanceLog.find().populate('vehicle', 'licensePlate make model').sort({ date: -1 });
    res.json(maintenanceLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/maintenance-logs/:id
// @desc    Get single maintenance log by ID
// @access  Public
exports.getMaintenanceLogById = async (req, res) => {
  try {
    const maintenanceLog = await MaintenanceLog.findById(req.params.id).populate('vehicle', 'licensePlate make model');
    if (!maintenanceLog) {
      return res.status(404).json({ msg: 'Maintenance log not found' });
    }
    res.json(maintenanceLog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Maintenance log not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/maintenance-logs
// @desc    Add new maintenance log
// @access  Private (Admin/Manager)
exports.addMaintenanceLog = async (req, res) => {
  const { vehicle, date, type, description, cost, odometerReading, nextServiceMileage, nextServiceDate } = req.body;

  try {
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // Update vehicle's current mileage if new reading is higher
    if (odometerReading && odometerReading > vehicleExists.mileage) {
      vehicleExists.mileage = odometerReading;
      await vehicleExists.save();
    }

    const newMaintenanceLog = new MaintenanceLog({
      vehicle,
      date,
      type,
      description,
      cost,
      odometerReading,
      nextServiceMileage,
      nextServiceDate
    });

    const maintenanceLog = await newMaintenanceLog.save();
    res.status(201).json(maintenanceLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/maintenance-logs/:id
// @desc    Update maintenance log
// @access  Private (Admin/Manager)
exports.updateMaintenanceLog = async (req, res) => {
  const { vehicle, date, type, description, cost, odometerReading, nextServiceMileage, nextServiceDate } = req.body;

  try {
    let maintenanceLog = await MaintenanceLog.findById(req.params.id);
    if (!maintenanceLog) {
      return res.status(404).json({ msg: 'Maintenance log not found' });
    }

    const updatedMaintenanceLog = await MaintenanceLog.findByIdAndUpdate(
      req.params.id,
      { $set: { vehicle, date, type, description, cost, odometerReading, nextServiceMileage, nextServiceDate } },
      { new: true, runValidators: true }
    ).populate('vehicle', 'licensePlate make model');

    // Optional: If odometerReading is updated to be higher than vehicle's current, update vehicle mileage
    if (odometerReading && odometerReading > (await Vehicle.findById(vehicle)).mileage) {
        await Vehicle.findByIdAndUpdate(vehicle, { $set: { mileage: odometerReading } });
    }

    res.json(updatedMaintenanceLog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Maintenance log not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/maintenance-logs/:id
// @desc    Delete maintenance log
// @access  Private (Admin/Manager)
exports.deleteMaintenanceLog = async (req, res) => {
  try {
    const maintenanceLog = await MaintenanceLog.findById(req.params.id);
    if (!maintenanceLog) {
      return res.status(404).json({ msg: 'Maintenance log not found' });
    }

    await MaintenanceLog.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Maintenance log removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Maintenance log not found' });
    }
    res.status(500).send('Server Error');
  }
};