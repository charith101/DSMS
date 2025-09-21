const express = require('express');
const router = express.Router();
const Appointment = require('../../models/Appointment');

// Get all appointments
router.get('/', (req, res) => {
  Appointment.find()
    .then(data => res.json(data))
    .catch(() => res.status(500).json("Server error"));
});

// Create a new appointment
router.post('/', (req, res) => {
  const newAppointment = new Appointment(req.body);
  newAppointment.save()
    .then(saved => res.status(201).json(saved))
    .catch(() => res.status(500).json("Server error"));
});

module.exports = router;