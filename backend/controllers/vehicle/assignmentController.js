// controllers/assignmentController.js
const Assignment = require('../models/Assignment');
const Vehicle = require('../models/Vehicle');

// @route   GET /api/assignments
// @desc    Get all assignments
// @access  Public
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('vehicle', 'make model licensePlate') // Populate vehicle details
      .sort({ startTime: -1 });
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/assignments/:id
// @desc    Get single assignment by ID
// @access  Public
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('vehicle', 'make model licensePlate');
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private (Admin/Manager)
exports.createAssignment = async (req, res) => {
  const { vehicle, assignedTo, assignedToType, purpose, startTime, endTime } = req.body;

  try {
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // Check for double booking
    const overlappingAssignment = await Assignment.findOne({
      vehicle,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } }, // New assignment starts within existing
        { endTime: { $gt: startTime, $lte: endTime } }, // New assignment ends within existing
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } } // Existing assignment encompasses new
      ],
      status: { $in: ['Scheduled', 'Active'] } // Only check against active or scheduled
    });

    if (overlappingAssignment) {
      return res.status(400).json({
        msg: 'Vehicle is already assigned during this time slot.',
        overlappingAssignment: overlappingAssignment
      });
    }

    const newAssignment = new Assignment({
      vehicle,
      assignedTo,
      assignedToType,
      purpose,
      startTime,
      endTime
    });

    const assignment = await newAssignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
// @access  Private (Admin/Manager)
exports.updateAssignment = async (req, res) => {
  const { vehicle, assignedTo, assignedToType, purpose, startTime, endTime, status } = req.body;

  try {
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }

    // If vehicle or time is changed, re-check for double booking
    if (
      (vehicle && vehicle !== assignment.vehicle.toString()) ||
      (startTime && new Date(startTime).getTime() !== assignment.startTime.getTime()) ||
      (endTime && new Date(endTime).getTime() !== assignment.endTime.getTime())
    ) {
      const checkVehicle = vehicle || assignment.vehicle;
      const checkStartTime = startTime || assignment.startTime;
      const checkEndTime = endTime || assignment.endTime;

      const overlappingAssignment = await Assignment.findOne({
        _id: { $ne: req.params.id }, // Exclude current assignment
        vehicle: checkVehicle,
        $or: [
          { startTime: { $lt: checkEndTime, $gte: checkStartTime } },
          { endTime: { $gt: checkStartTime, $lte: checkEndTime } },
          { startTime: { $lte: checkStartTime }, endTime: { $gte: checkEndTime } }
        ],
        status: { $in: ['Scheduled', 'Active'] }
      });

      if (overlappingAssignment) {
        return res.status(400).json({
          msg: 'Vehicle is already assigned during this updated time slot.',
          overlappingAssignment: overlappingAssignment
        });
      }
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: { vehicle, assignedTo, assignedToType, purpose, startTime, endTime, status } },
      { new: true, runValidators: true }
    ).populate('vehicle', 'make model licensePlate');

    res.json(updatedAssignment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Admin/Manager)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }

    await Assignment.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Assignment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    res.status(500).send('Server Error');
  }
};