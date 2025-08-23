const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  bookedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  }
});

module.exports = mongoose.model('TimeSlot', TimeSlotSchema);