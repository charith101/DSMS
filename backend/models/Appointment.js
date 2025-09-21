const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: Date,
  reason: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);