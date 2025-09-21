const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);