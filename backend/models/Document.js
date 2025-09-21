const mongoose = require('mongoose');

const DocumentSchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    documentType: { // E.g., 'Registration', 'Insurance', 'Inspection'
      type: String,
      required: true,
    },
    documentName: {
      type: String,
      required: true,
    },
    filePath: { // Path to the uploaded document
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', DocumentSchema);
module.exports = Document;