const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: false
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  originalCurrency: {
    type: String,
    required: false,
    default: 'LKR'
  },
  sessionId: {
    type: String,
    required: false,
    index: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Paid'
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);