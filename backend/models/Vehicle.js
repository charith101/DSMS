const mongoose = require('mongoose');

const MaintenanceHistorySchema = new mongoose.Schema({
  serviceDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  nextServiceDue: {
    type: Date,
    required: true,
  },
});

const FuelLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  liters: {
    type: Number,
    required: true,
    min: 0,
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
});

const InsuranceSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  policyNumber: {
    type: String,
    required: true,
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

const VehicleSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['Car', 'Bike', 'Van', 'Other'], // Adjust enum based on needs
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'In Use', 'Maintenance', 'Unavailable'],
      default: 'Available',
    },
    maintenanceHistory: [MaintenanceHistorySchema],
    fuelLogs: [FuelLogSchema],
    insurance: InsuranceSchema,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;