const mongoose = require('mongoose');

const AttendanceStaffSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String
  },
  hoursWorked: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave'],
    required: true
  }
});

AttendanceStaffSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceStaff', AttendanceStaffSchema);