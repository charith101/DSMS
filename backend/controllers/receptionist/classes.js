const express = require('express');
const Class = require('../../models/Class');

const router = express.Router();

router.get('/', (req, res) => {
  Class.find()
    .then(data => res.json(data))
    .catch(() => res.status(500).json("Server error"));
});

router.post('/', (req, res) => {
  const newClass = new Class(req.body);
  newClass.save()
    .then(saved => res.status(201).json(saved))
    .catch(() => res.status(500).json("Server error"));
});

module.exports = router;