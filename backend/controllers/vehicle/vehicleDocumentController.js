const VehicleDocument = require('../models/VehicleDocument');
const Vehicle = require('../models/Vehicle');
// Assuming you'll handle file uploads (e.g., with multer and cloud storage)
// For simplicity, we'll assume fileUrl is provided in the request body for now.

// @route   GET /api/vehicle-documents
// @desc    Get all vehicle documents
// @access  Public
exports.getAllVehicleDocuments = async (req, res) => {
  try {
    const documents = await VehicleDocument.find().populate('vehicle', 'licensePlate make model').sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/vehicle-documents/vehicle/:vehicleId
// @desc    Get all documents for a specific vehicle
// @access  Public
exports.getDocumentsByVehicle = async (req, res) => {
  try {
    const documents = await VehicleDocument.find({ vehicle: req.params.vehicleId })
      .populate('vehicle', 'licensePlate make model')
      .sort({ expiryDate: 1 }); // Sort by expiry date to show expiring first
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.status(500).send('Server Error');
  }
};


// @route   GET /api/vehicle-documents/:id
// @desc    Get single vehicle document by ID
// @access  Public
exports.getVehicleDocumentById = async (req, res) => {
  try {
    const document = await VehicleDocument.findById(req.params.id).populate('vehicle', 'licensePlate make model');
    if (!document) {
      return res.status(404).json({ msg: 'Vehicle document not found' });
    }
    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle document not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/vehicle-documents
// @desc    Add new vehicle document
// @access  Private (Admin/Manager)
exports.addVehicleDocument = async (req, res) => {
  const { vehicle, documentType, fileName, fileUrl, issueDate, expiryDate, description } = req.body;

  try {
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    const newDocument = new VehicleDocument({
      vehicle,
      documentType,
      fileName,
      fileUrl,
      issueDate,
      expiryDate,
      description
    });

    const document = await newDocument.save();
    res.status(201).json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/vehicle-documents/:id
// @desc    Update vehicle document
// @access  Private (Admin/Manager)
exports.updateVehicleDocument = async (req, res) => {
  const { vehicle, documentType, fileName, fileUrl, issueDate, expiryDate, description } = req.body;

  try {
    let document = await VehicleDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Vehicle document not found' });
    }

    const updatedDocument = await VehicleDocument.findByIdAndUpdate(
      req.params.id,
      { $set: { vehicle, documentType, fileName, fileUrl, issueDate, expiryDate, description } },
      { new: true, runValidators: true }
    ).populate('vehicle', 'licensePlate make model');

    res.json(updatedDocument);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle document not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/vehicle-documents/:id
// @desc    Delete vehicle document
// @access  Private (Admin/Manager)
exports.deleteVehicleDocument = async (req, res) => {
  try {
    const document = await VehicleDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Vehicle document not found' });
    }

    // Optional: If files are stored on cloud storage, you might want to delete them here
    // e.g., if using AWS S3: s3.deleteObject({ Bucket: 'your-bucket', Key: document.fileName }).promise();

    await VehicleDocument.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Vehicle document removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle document not found' });
    }
    res.status(500).send('Server Error');
  }
};