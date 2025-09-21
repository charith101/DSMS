const express = require('express');
const Attendance = require('../../models/Attendance');

const router = express.Router();

// Get all attendance records
router.get('/', (req, res) => {
  Attendance.find()
    .populate('classId')
    .then(data => res.json(data))
    .catch(() => res.status(500).json("Server error"));
});

// Create a new attendance record
router.post('/', (req, res) => {
  const newAttendance = new Attendance(req.body);
  newAttendance.save()
    .then(saved => res.status(201).json(saved))
    .catch(() => res.status(500).json("Server error"));
});

module.exports = router;