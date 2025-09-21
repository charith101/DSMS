const mongoose = require('mongoose');

const VehicleSchema = mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    transmissionType: {
      type: String,
      enum: ['Manual', 'Auto'],
      required: true,
    },
    engineCapacity: {
      type: Number, // in CC
      required: true,
      min: 50,
    },
    registrationDate: {
      type: Date,
      required: true,
    },
    vehiclePhoto: {
      type: String, // Storing the path to the photo
      default: null,
    },
    // Other potential fields like status, current mileage, etc.
    status: {
      type: String,
      enum: ['Active', 'In Maintenance', 'Sold'],
      default: 'Active',
    },
    currentMileage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;