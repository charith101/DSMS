const express = require('express');
const router = express.Router();
const UserModel = require('../../model/Users');

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
  UserModel.find({})
    .then(users => res.json(users))
    .catch(err => res.status(500).json(err));
});

router.get('/getUser/:id', (req, res) => {
  UserModel.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err));
});

router.put('/updateUser/:id', (req, res) => {
  UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      nic: req.body.nic,
      password: req.body.password
    },
    { runValidators: true, new: true }
  )
  .then(user => res.status(201).json(user))
  .catch(err => {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

router.delete('/deleteUser/:id', (req, res) => {
  UserModel.findByIdAndDelete(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err));
});

module.exports = router;