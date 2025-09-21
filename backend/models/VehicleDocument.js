// models/VehicleDocument.js
const mongoose = require('mongoose');

const VehicleDocumentSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  documentType: { type: String, required: true, enum: ['Registration', 'Insurance', 'Road Tax', 'Inspection Report', 'Permit', 'Other'] },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // URL to stored document (e.g., S3, Google Cloud Storage)
  issueDate: { type: Date },
  expiryDate: { type: Date },
  description: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VehicleDocument', VehicleDocumentSchema);