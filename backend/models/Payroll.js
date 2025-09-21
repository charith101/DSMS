const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true,
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format (YYYY-MM)']
  },
  totalHours: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  paidDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  }
});

PayrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);