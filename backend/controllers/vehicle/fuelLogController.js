// controllers/fuelLogController.js
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');

// @route   GET /api/fuel-logs
// @desc    Get all fuel logs
// @access  Public
exports.getAllFuelLogs = async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find().populate('vehicle', 'licensePlate make model').sort({ date: -1 });
    res.json(fuelLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/fuel-logs/:id
// @desc    Get single fuel log by ID
// @access  Public
exports.getFuelLogById = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id).populate('vehicle', 'licensePlate make model');
    if (!fuelLog) {
      return res.status(404).json({ msg: 'Fuel log not found' });
    }
    res.json(fuelLog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Fuel log not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/fuel-logs
// @desc    Add new fuel log
// @access  Private (Admin/Manager)
exports.addFuelLog = async (req, res) => {
  const { vehicle, date, cost, liters, odometerReading } = req.body;

  try {
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // Optionally update vehicle's current mileage if new reading is higher
    if (odometerReading > vehicleExists.mileage) {
      vehicleExists.mileage = odometerReading;
      await vehicleExists.save();
    }

    const newFuelLog = new FuelLog({
      vehicle,
      date,
      cost,
      liters,
      odometerReading
    });

    const fuelLog = await newFuelLog.save();
    res.status(201).json(fuelLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/fuel-logs/:id
// @desc    Update fuel log
// @access  Private (Admin/Manager)
exports.updateFuelLog = async (req, res) => {
  const { vehicle, date, cost, liters, odometerReading } = req.body;

  try {
    let fuelLog = await FuelLog.findById(req.params.id);
    if (!fuelLog) {
      return res.status(404).json({ msg: 'Fuel log not found' });
    }

    const updatedFuelLog = await FuelLog.findByIdAndUpdate(
      req.params.id,
      { $set: { vehicle, date, cost, liters, odometerReading } },
      { new: true, runValidators: true }
    ).populate('vehicle', 'licensePlate make model');

    // Logic to potentially update vehicle mileage would be more complex here
    // if odometer reading is changed significantly. For simplicity, we'll keep
    // the mileage update primarily on new fuel logs.

    res.json(updatedFuelLog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Fuel log not not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/fuel-logs/:id
// @desc    Delete fuel log
// @access  Private (Admin/Manager)
exports.deleteFuelLog = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id);
    if (!fuelLog) {
      return res.status(404).json({ msg: 'Fuel log not found' });
    }

    await FuelLog.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Fuel log removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Fuel log not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/fuel-logs/summary
// @desc    Get monthly fuel usage summary and efficiency
// @access  Public
exports.getFuelUsageSummary = async (req, res) => {
  const { year, vehicleId } = req.query; // Optional vehicleId for specific vehicle summary

  try {
    let matchQuery = {};
    if (vehicleId) {
      matchQuery.vehicle = mongoose.Types.ObjectId(vehicleId);
    }
    if (year) {
      matchQuery.date = {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`)
      };
    }

    const fuelSummary = await FuelLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            vehicle: "$vehicle"
          },
          totalCost: { $sum: "$cost" },
          totalLiters: { $sum: "$liters" },
          firstOdometer: { $min: "$odometerReading" },
          lastOdometer: { $max: "$odometerReading" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'vehicles', // The name of the collection in MongoDB
          localField: '_id.vehicle',
          foreignField: '_id',
          as: 'vehicleDetails'
        }
      },
      {
        $unwind: {
          path: '$vehicleDetails',
          preserveNullAndEmptyArrays: true // Keep logs even if vehicle details aren't found
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          vehicleId: "$_id.vehicle",
          vehicleLicensePlate: "$vehicleDetails.licensePlate",
          vehicleMakeModel: { $concat: ["$vehicleDetails.make", " ", "$vehicleDetails.model"] },
          totalCost: { $round: ["$totalCost", 2] },
          totalLiters: { $round: ["$totalLiters", 2] },
          distanceDriven: { $subtract: ["$lastOdometer", "$firstOdometer"] }, // Assuming odometer readings are chronological
          efficiencyKmPerL: {
            $cond: {
              if: { $and: [{ $gt: ["$totalLiters", 0] }, { $gt: [{ $subtract: ["$lastOdometer", "$firstOdometer"] }, 0] }] },
              then: { $round: [{ $divide: [{ $subtract: ["$lastOdometer", "$firstOdometer"] }, "$totalLiters"] }, 2] },
              else: 0
            }
          },
          logsCount: "$count"
        }
      },
      {
        $sort: { year: 1, month: 1, vehicleLicensePlate: 1 }
      }
    ]);

    res.json(fuelSummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};