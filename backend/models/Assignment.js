const mongoose = require('mongoose');

const AssignmentSchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: { // Assuming a Driver model exists or a simple string for now
      type: String, // or mongoose.Schema.Types.ObjectId if you have a User/Driver model
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null, // Null if currently assigned
    },
    purpose: {
      type: String,
      default: 'Driving Lesson',
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;