const express = require('express');
const Feedback = require('../../models/Feedback');

const router = express.Router();

router.get('/', (req, res) => {
  Feedback.find()
    .then(data => res.json(data))
    .catch(() => res.status(500).json("Server error"));
});

router.post('/', (req, res) => {
  const newFeedback = new Feedback(req.body);
  newFeedback.save()
    .then(saved => res.status(201).json(saved))
    .catch(() => res.status(500).json("Server error"));
});

module.exports = router;