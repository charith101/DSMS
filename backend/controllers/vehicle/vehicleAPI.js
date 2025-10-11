const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const VehicleModel = require('../../models/Vehicle');
const DocumentModel = require('../../models/Document'); // Assuming still separate

// Vehicle Routes (Updated for new schema)

router.post('/createVehicle', async (req, res) => {
  try {
    const { type, model, licensePlate, capacity, purchaseDate, licenseExpiry, availabilityStatus, maintenanceHistory, fuelLogs, insurance } = req.body;
    
    // Basic validation for required fields
    if (!type || !model || !licensePlate || !capacity || !purchaseDate || !licenseExpiry) {
      return res.status(400).json({ error: 'All required fields (type, model, licensePlate, capacity, purchaseDate, licenseExpiry) must be provided' });
    }

    const vehicle = await VehicleModel.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.get('/getVehicles', async (req, res) => {
  try {
    const vehicles = await VehicleModel.find().lean();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateVehicle/:id', async (req, res) => {
  try {
    const vehicle = await VehicleModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.delete('/deleteVehicle/:id', async (req, res) => {
  try {
    const vehicle = await VehicleModel.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// FuelLog Routes (Updated to append to embedded fuelLogs array)

router.post('/createFuelLog', async (req, res) => {
  try {
    const { vehicleId, date, liters, cost } = req.body;
    
    if (!vehicleId || !date || liters === undefined || cost === undefined) {
      return res.status(400).json({ error: 'Required fields: vehicleId, date, liters, cost' });
    }

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) {
      return res.status(400).json({ error: 'Invalid vehicle' });
    }

    const newFuelLog = {
      date: new Date(date),
      liters,
      cost,
    };

    vehicle.fuelLogs.push(newFuelLog);
    await vehicle.save();

    const populatedVehicle = await VehicleModel.findById(vehicleId).lean();
    res.status(201).json(populatedVehicle);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.get('/getFuelLogs', async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({}, { fuelLogs: 1 }).lean();
    // Flatten all fuel logs across vehicles
    const allFuelLogs = vehicles.flatMap(v => v.fuelLogs.map(log => ({ ...log, vehicleId: v._id })));
    res.json(allFuelLogs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateFuelLog/:vehicleId/:logIndex', async (req, res) => {
  try {
    const { vehicleId, logIndex } = { vehicleId: req.params.vehicleId, logIndex: parseInt(req.params.logIndex) };
    const { date, liters, cost } = req.body;

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || !vehicle.fuelLogs[logIndex]) {
      return res.status(404).json({ error: 'Fuel log not found' });
    }

    if (date !== undefined) vehicle.fuelLogs[logIndex].date = new Date(date);
    if (liters !== undefined) vehicle.fuelLogs[logIndex].liters = liters;
    if (cost !== undefined) vehicle.fuelLogs[logIndex].cost = cost;

    await vehicle.save();
    const populatedVehicle = await VehicleModel.findById(vehicleId).lean();
    res.json(populatedVehicle);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.delete('/deleteFuelLog/:vehicleId/:logIndex', async (req, res) => {
  try {
    const { vehicleId, logIndex } = { vehicleId: req.params.vehicleId, logIndex: parseInt(req.params.logIndex) };

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || !vehicle.fuelLogs[logIndex]) {
      return res.status(404).json({ error: 'Fuel log not found' });
    }

    vehicle.fuelLogs.splice(logIndex, 1);
    await vehicle.save();

    res.json({ message: 'Fuel log deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Maintenance Routes (Updated to append to embedded maintenanceHistory array)

router.post('/createMaintenance', async (req, res) => {
  try {
    const { vehicleId, serviceDate, description, nextServiceDue } = req.body;
    
    if (!vehicleId || !serviceDate || !description || !nextServiceDue) {
      return res.status(400).json({ error: 'Required fields: vehicleId, serviceDate, description, nextServiceDue' });
    }

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) {
      return res.status(400).json({ error: 'Invalid vehicle' });
    }

    const newMaintenance = {
      serviceDate: new Date(serviceDate),
      description,
      nextServiceDue: new Date(nextServiceDue),
    };

    vehicle.maintenanceHistory.push(newMaintenance);
    await vehicle.save();

    const populatedVehicle = await VehicleModel.findById(vehicleId).lean();
    res.status(201).json(populatedVehicle);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.get('/getMaintenances', async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({}, { maintenanceHistory: 1 }).lean();
    // Flatten all maintenance across vehicles
    const allMaintenances = vehicles.flatMap(v => v.maintenanceHistory.map(hist => ({ ...hist, vehicleId: v._id })));
    res.json(allMaintenances);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateMaintenance/:vehicleId/:histIndex', async (req, res) => {
  try {
    const { vehicleId, histIndex } = { vehicleId: req.params.vehicleId, histIndex: parseInt(req.params.histIndex) };
    const { serviceDate, description, nextServiceDue } = req.body;

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || !vehicle.maintenanceHistory[histIndex]) {
      return res.status(404).json({ error: 'Maintenance not found' });
    }

    if (serviceDate !== undefined) vehicle.maintenanceHistory[histIndex].serviceDate = new Date(serviceDate);
    if (description !== undefined) vehicle.maintenanceHistory[histIndex].description = description;
    if (nextServiceDue !== undefined) vehicle.maintenanceHistory[histIndex].nextServiceDue = new Date(nextServiceDue);

    await vehicle.save();
    const populatedVehicle = await VehicleModel.findById(vehicleId).lean();
    res.json(populatedVehicle);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.delete('/deleteMaintenance/:vehicleId/:histIndex', async (req, res) => {
  try {
    const { vehicleId, histIndex } = { vehicleId: req.params.vehicleId, histIndex: parseInt(req.params.histIndex) };

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || !vehicle.maintenanceHistory[histIndex]) {
      return res.status(404).json({ error: 'Maintenance not found' });
    }

    vehicle.maintenanceHistory.splice(histIndex, 1);
    await vehicle.save();

    res.json({ message: 'Maintenance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Document Routes (Unchanged, assuming separate model)

router.post('/createDocument', async (req, res) => {
  try {
    const { vehicle, documentType, documentName, filePath, expiryDate } = req.body;
    
    // Note: vehicle now refers to _id, but schema uses licensePlate or type? Assuming _id ref
    const vehicleDoc = await VehicleModel.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(400).json({ error: 'Invalid vehicle' });
    }

    const document = await DocumentModel.create({
      vehicle,
      documentType,
      documentName,
      filePath,
      expiryDate
    });
    
    const populatedDocument = await DocumentModel.findById(document._id).populate('vehicle', 'type model licensePlate');
    res.status(201).json(populatedDocument);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.get('/getDocuments', async (req, res) => {
  try {
    const documents = await DocumentModel.find()
      .populate('vehicle', 'type model licensePlate')
      .lean();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateDocument/:id', async (req, res) => {
  try {
    const { vehicle } = req.body;
    
    if (vehicle) {
      const vehicleDoc = await VehicleModel.findById(vehicle);
      if (!vehicleDoc) {
        return res.status(400).json({ error: 'Invalid vehicle' });
      }
    }

    const document = await DocumentModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    )
      .populate('vehicle', 'type model licensePlate');
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.delete('/deleteDocument/:id', async (req, res) => {
  try {
    const document = await DocumentModel.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;