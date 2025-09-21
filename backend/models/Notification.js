const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: String,
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);