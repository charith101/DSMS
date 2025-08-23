const mongoose = require('mongoose');

const AttendanceStudentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

AttendanceStudentSchema.index({ studentId: 1, timeSlotId: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceStudent', AttendanceStudentSchema);