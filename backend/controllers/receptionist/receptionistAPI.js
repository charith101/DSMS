const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const TimeSlotModel = require('../../models/TimeSlot');
const UserModel = require('../../models/Users');
const VehicleModel = require('../../models/Vehicle');
const AttendanceStudentModel = require('../../models/AttendanceStudent');

router.post('/createTimeSlot', async (req, res) => {
  try {
    const { instructorId, vehicleId, date, startTime, endTime, status, maxCapacity } = req.body;

    const instructor = await UserModel.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(400).json({ error: 'Invalid instructor' });
    }

    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle || vehicle.status !== 'Active') {
      return res.status(400).json({ error: 'Invalid vehicle' });
    }

    const timeSlot = await TimeSlotModel.create({
      instructorId,
      vehicleId,
      date,
      startTime,
      endTime,
      status,
      maxCapacity,
      bookedStudents: []
    });

    res.status(201).json(timeSlot);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.get('/getTimeSlots', async (req, res) => {
  try {
    const timeSlots = await TimeSlotModel.find()
      .populate({ path: 'instructorId', select: 'name email' })
      .populate({ path: 'vehicleId', select: 'make model vehicleNumber' })
      .populate({ path: 'bookedStudents', select: 'name' })
      .lean();
    res.json(timeSlots);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateTimeSlot/:id', async (req, res) => {
  try {
    const { instructorId, vehicleId } = req.body;

    if (instructorId) {
      const instructor = await UserModel.findById(instructorId);
      if (!instructor || instructor.role !== 'instructor') {
        return res.status(400).json({ error: 'Invalid instructor' });
      }
    }

    if (vehicleId) {
      const vehicle = await VehicleModel.findById(vehicleId);
      if (!vehicle || vehicle.status !== 'Active') {
        return res.status(400).json({ error: 'Invalid vehicle' });
      }
    }

    const timeSlot = await TimeSlotModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { runValidators: true, new: true }
    )
      .populate({ path: 'instructorId', select: 'name email' })
      .populate({ path: 'vehicleId', select: 'make model vehicleNumber' })
      .populate({ path: 'bookedStudents', select: 'name' });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    res.json(timeSlot);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.delete('/deleteTimeSlot/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlotModel.findByIdAndDelete(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }
    res.json({ message: 'Time slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/getInstructors', async (req, res) => {
  try {
    const instructors = await UserModel.find({ role: 'instructor' })
      .select('name email')
      .lean();
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/getVehicles', async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({ availabilityStatus : 'Available' })
      .select('make model vehicleNumber')
      .lean();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/getPendingAttendance/:timeSlotId', async (req, res) => {
  try {
    const { timeSlotId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(timeSlotId)) {
      return res.status(400).json({ error: 'Invalid time slot ID' });
    }
    const timeSlot = await TimeSlotModel.findById(timeSlotId)
      .populate('bookedStudents', 'name email nic');
    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    // Filter out nulls from populated bookedStudents (in case of invalid refs)
    timeSlot.bookedStudents = timeSlot.bookedStudents.filter(student => student !== null);

    const attendances = await AttendanceStudentModel.find({ timeSlotId: timeSlotId })
      .populate('markedBy', 'name');
    const attendedStudentIds = attendances.map(a => a.studentId.toString());

    const pendingStudents = timeSlot.bookedStudents.filter(
      student => !attendedStudentIds.includes(student._id.toString())
    );

    res.json({
      timeSlot,
      pendingStudents,
      attendances
    });
  } catch (err) {
    console.error('Error in getPendingAttendance:', err); // For debugging
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/markAttendance', async (req, res) => {
  try {
    const { timeSlotId, studentId, status, markedBy } = req.body;

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Present or Absent' });
    }

    const timeSlot = await TimeSlotModel.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    const existingAttendance = await AttendanceStudentModel.findOne({
      studentId,
      timeSlotId
    });

    let attendance;

    if (existingAttendance) {
      // Update existing
      existingAttendance.status = status;
      existingAttendance.markedBy = markedBy;
      existingAttendance.date = timeSlot.date;
      attendance = await existingAttendance.save();
    } else {
      // Create new
      attendance = await AttendanceStudentModel.create({
        studentId,
        timeSlotId,
        status,
        markedBy,
        date: timeSlot.date
      });
    }

    res.status(200).json(attendance);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;