// controllers/documentController.js
const asyncHandler = require('express-async-handler');
const Document = require('../models/Document');
const Vehicle = require('../models/Vehicle'); // To ensure vehicle exists
const fs = require('fs');
const path = require('path');

// @desc    Upload a new document
// @route   POST /api/documents/upload/:vehicleId
// @access  Private (you'd add authentication middleware)
const uploadDocument = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { documentType, expiryDate } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    // If vehicle not found, delete the uploaded file
    fs.unlinkSync(req.file.path);
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const newDocument = await Document.create({
    vehicle: vehicleId,
    documentType,
    fileName: req.file.originalname,
    filePath: req.file.path, // Store the relative path
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
  });

  res.status(201).json({
    message: 'Document uploaded successfully',
    document: newDocument,
  });
});

// @desc    Get all documents for a specific vehicle
// @route   GET /api/documents/:vehicleId
// @access  Private
const getVehicleDocuments = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const documents = await Document.find({ vehicle: vehicleId }).sort({ expiryDate: 1 });
  res.json(documents);
});

// @desc    Get a single document
// @route   GET /api/documents/single/:id
// @access  Private
const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).populate('vehicle', 'make model licensePlate');

  if (document) {
    res.json(document);
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Update a document (e.g., expiry date, document type)
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = asyncHandler(async (req, res) => {
  const { documentType, expiryDate } = req.body;

  const document = await Document.findById(req.params.id);

  if (document) {
    document.documentType = documentType || document.documentType;
    if (expiryDate) {
      document.expiryDate = new Date(expiryDate);
      document.reminderSent = false; // Reset reminder if expiry date is updated
    }

    const updatedDocument = await document.save();
    res.json(updatedDocument);
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Delete a document and its file
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (document) {
    // Delete the file from the server
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    await document.remove();
    res.json({ message: 'Document and file removed' });
  } else {
    res.status(404);
    throw new Error('Document not found');
  }
});

// @desc    Download a document
// @route   GET /api/documents/download/:id
// @access  Private
const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (document && fs.existsSync(document.filePath)) {
    res.download(document.filePath, document.fileName); // Send file for download
  } else {
    res.status(404);
    throw new Error('Document not found or file does not exist');
  }
});


// Utility function to check for expiring documents (can be run as a scheduled task)
const checkExpiringDocuments = asyncHandler(async () => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    const expiringDocs = await Document.find({
        expiryDate: { $lte: threeMonthsFromNow, $gte: today },
        reminderSent: false,
    }).populate('vehicle', 'licensePlate make model');

    if (expiringDocs.length > 0) {
        console.log('--- Expiring Documents Report ---');
        expiringDocs.forEach(async (doc) => {
            console.log(
                `ALERT: Document Type: ${doc.documentType} for Vehicle: ${doc.vehicle.make} ${doc.vehicle.model} (${doc.vehicle.licensePlate}) is expiring on ${doc.expiryDate.toDateString()}.`
            );
            // In a real application, you would send emails, push notifications, etc.
            // For now, we'll just log it.

            // Mark reminder as sent to avoid repeated alerts for the same event
            doc.reminderSent = true;
            await doc.save();
        });
        console.log('--- End of Report ---');
    } else {
        console.log('No documents expiring in the next 3 months.');
    }
});

// You might want to export this to be called by a cron job or a background task runner.
// For now, we can manually call it or integrate it into a /api route for testing.
// However, it's best to run this outside of a direct API request.
module.exports = {
  uploadDocument,
  getVehicleDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  checkExpiringDocuments, // Exported for potential external scheduling
};