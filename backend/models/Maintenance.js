const mongoose = require('mongoose');

const MaintenanceSchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
      trim: true,
    },
    scheduleDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Canceled'],
      default: 'Scheduled',
    },
    completionDate: {
      type: Date,
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    // For alerts/reminders
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);

module.exports = Maintenance;