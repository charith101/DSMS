// models/MaintenanceLog.js
const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true, enum: ['Service', 'Repair', 'Inspection', 'Tyre Change', 'Oil Change', 'Other'] },
  description: { type: String },
  cost: { type: Number, default: 0 },
  odometerReading: { type: Number, required: true, min: 0 },
  nextServiceMileage: { type: Number }, // Suggested next service mileage
  nextServiceDate: { type: Date }, // Suggested next service date
  recordedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);