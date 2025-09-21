const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: String,
  instructor: String,
  schedule: Date,
  capacity: Number
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);