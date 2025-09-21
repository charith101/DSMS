const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Car", "Van", "Bike", "Truck"],
    required: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Z0-9-]+$/, "Invalid license plate format"]
  },
  capacity: {
    type: Number,
    min: 1,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  availabilityStatus: {
    type: String,
    enum: ["Available", "In Maintenance", "Unavailable"],
    default: "Available"
  },
  maintenanceHistory: [{
    serviceDate: { type: Date, required: true },
    description: { type: String, trim: true },
    nextServiceDue: { type: Date }
  }],
  fuelLogs: [{
    date: { type: Date, required: true },
    liters: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 }
  }],
  insurance: {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    expiryDate: { type: Date }
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);