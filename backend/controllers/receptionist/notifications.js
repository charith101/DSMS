const express = require('express');
const Notification = require('../../models/Notification');

const router = express.Router();

router.get('/', (req, res) => {
  Notification.find()
    .then(data => res.json(data))
    .catch(() => res.status(500).json("Server error"));
});

router.post('/', (req, res) => {
  const newNotification = new Notification(req.body);
  newNotification.save()
    .then(saved => res.status(201).json(saved))
    .catch(() => res.status(500).json("Server error"));
});

module.exports = router;