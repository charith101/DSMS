const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  requestedOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);