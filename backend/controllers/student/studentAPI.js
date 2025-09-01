const express = require('express');
const router = express.Router();
const UserModel = require('../../model/Users');
const PaymentModel = require('../../model/Payment');

router.post('/registerUser', (req, res) => {
  UserModel.create(req.body)
    .then(user => res.status(201).json(user))
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
  UserModel.find({ role: 'student' })
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.get('/getUser/:id', (req, res) => {
  UserModel.findById(req.params.id)
    .then(user => {
      if (!user || user.role !== 'student') {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.put('/updateUser/:id', (req, res) => {
  UserModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true, new: true }
  )
    .then(user => {
      if (!user || user.role !== 'student') {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.delete('/deleteUser/:id', (req, res) => {
  UserModel.findByIdAndDelete(req.params.id)
    .then(user => {
      if (!user || user.role !== 'student') {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.post('/addPayment', (req, res) => {
  PaymentModel.create(req.body)
    .then(payment => res.status(201).json(payment))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.get('/getPayments/:studentId', (req, res) => {
  PaymentModel.find({ studentId: req.params.studentId })
    .then(payments => res.json(payments))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

module.exports = router;