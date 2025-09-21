const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentName: String,
  feedback: String,
  rating: Number
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);