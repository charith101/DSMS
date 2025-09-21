const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserModel = require('../../models/Users');
const LeaveRequestModel = require('../../models/LeaveRequest');

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

router.post('/newLeaveRequest', (req, res) => {
  LeaveRequestModel.create(req.body)
    .then(leaveRequest => res.status(201).json(leaveRequest))
    .catch(err => {
      if (err.code === 11000) {
        return res.status(400).json({ error: "Duplicate leave request data" });
      } else if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    });
});

router.get('/getLeave', (req, res) => {
  LeaveRequestModel.find()
    .populate('staffId', 'name') // Populate the staffId with the name field from UserModel
    .then(leaveRequests => res.json(leaveRequests))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.get('/getLeave/:id', (req, res) => {
  LeaveRequestModel.findById(req.params.id)
    .populate('staffId', 'name') // Populate for individual get as well
    .then(leaveRequest => {
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      res.json(leaveRequest);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.put('/updateLeave/:id', (req, res) => {
  LeaveRequestModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true, new: true }
  )
    .then(leaveRequest => {
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      // Repopulate staffId after update to ensure name is included
      return LeaveRequestModel.findById(leaveRequest._id).populate('staffId', 'name');
    })
    .then(populatedLeaveRequest => {
      res.json(populatedLeaveRequest);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.delete('/deleteLeave/:id', (req, res) => {
  LeaveRequestModel.findByIdAndDelete(req.params.id)
    .then(leaveRequest => {
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      res.json(leaveRequest);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

module.exports = router;