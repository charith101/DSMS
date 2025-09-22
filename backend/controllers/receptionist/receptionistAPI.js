const express = require('express');
const router = express.Router();
const TimeSlot = require('../../models/TimeSlot');
const User = require('../../models/Users');
const Vehicle = require('../../models/Vehicle');

// Get all time slots
router.get('/timeslots', async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find()
      .populate('instructorId', 'name')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('bookedStudents', 'name');
    res.status(200).json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time slots', error: error.message });
  }
});

// Get a specific time slot by ID
router.get('/timeslots/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id)
      .populate('instructorId', 'name')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('bookedStudents', 'name');
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.status(200).json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time slot', error: error.message });
  }
});

// Create a new time slot
router.post('/timeslots', async (req, res) => {
  try {
    const { date, startTime, endTime, status, instructorId, vehicleId, maxCapacity } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime || !status || !instructorId || !vehicleId || !maxCapacity) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate status
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Validate instructorId exists and is an instructor
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(400).json({ message: 'Invalid or non-existent instructor ID' });
    }

    // Validate vehicleId exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(400).json({ message: 'Invalid or non-existent vehicle ID' });
    }

    // Validate maxCapacity
    if (maxCapacity < 1) {
      return res.status(400).json({ message: 'Max capacity must be at least 1' });
    }

    const timeSlot = new TimeSlot({
      date,
      startTime,
      endTime,
      status,
      instructorId,
      vehicleId,
      maxCapacity,
      bookedStudents: []
    });

    const savedTimeSlot = await timeSlot.save();
    const populatedTimeSlot = await TimeSlot.findById(savedTimeSlot._id)
      .populate('instructorId', 'name')
      .populate('vehicleId', 'vehicleNumber make model');

    res.status(201).json(populatedTimeSlot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating time slot', error: error.message });
  }
});

// Update a time slot
router.put('/timeslots/:id', async (req, res) => {
  try {
    const { date, startTime, endTime, status, instructorId, vehicleId, maxCapacity } = req.body;

    // Validate status if provided
    if (status && !['active', 'disabled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Validate instructorId if provided
    if (instructorId) {
      const instructor = await User.findById(instructorId);
      if (!instructor || instructor.role !== 'instructor') {
        return res.status(400).json({ message: 'Invalid or non-existent instructor ID' });
      }
    }

    // Validate vehicleId if provided
    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(400).json({ message: 'Invalid or non-existent vehicle ID' });
      }
    }

    // Validate maxCapacity if provided
    if (maxCapacity && maxCapacity < 1) {
      return res.status(400).json({ message: 'Max capacity must be at least 1' });
    }

    const updateData = {};
    if (date) updateData.date = date;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (status) updateData.status = status;
    if (instructorId) updateData.instructorId = instructorId;
    if (vehicleId) updateData.vehicleId = vehicleId;
    if (maxCapacity) updateData.maxCapacity = maxCapacity;

    const timeSlot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('instructorId', 'name')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('bookedStudents', 'name');

    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    res.status(200).json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: 'Error updating time slot', error: error.message });
  }
});

// Delete a time slot
router.delete('/timeslots/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.status(200).json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time slot', error: error.message });
  }
});

module.exports = router;