const mongoose = require('mongoose');

const FuelLogSchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    odometerReading: {
      type: Number,
      required: true,
    },
    fuelAmount: { // Liters/Gallons
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FuelLog = mongoose.model('FuelLog', FuelLogSchema);
module.exports = FuelLog;