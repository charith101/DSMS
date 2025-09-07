const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserModel = require('../../model/Users');

router.post('/registerEmployee', (req, res) => {
  UserModel.create(req.body)
    .then(user => {
      if (user.role !== 'receptionist' && user.role !== 'instructor') {
        return res.status(400).json({ error: 'Invalid employee role' });
      }
      res.status(201).json(user);
    })
    .catch(err => {
      if (err.code === 11000 && err.keyPattern?.email) {
        return res.status(400).json({ error: "Email already registered" });
      } else if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    });
});

router.get('/', (req, res) => {
  UserModel.find({ role: { $in: ['receptionist', 'instructor'] } })
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.get('/getEmployee/:id', (req, res) => {
  UserModel.findById(req.params.id)
    .then(user => {
      if (!user || !['receptionist', 'instructor'].includes(user.role)) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.put('/updateEmployee/:id', (req, res) => {
  UserModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true, new: true }
  )
    .then(user => {
      if (!user || !['receptionist', 'instructor'].includes(user.role)) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.delete('/deleteEmployee/:id', (req, res) => {
  UserModel.findByIdAndDelete(req.params.id)
    .then(user => {
      if (!user || !['receptionist', 'instructor'].includes(user.role)) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

module.exports = router;