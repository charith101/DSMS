const express = require('express');
const router = express.Router();
const TimeSlotModel = require('../../models/TimeSlot');
const StudentModel = require('../../models/Users');
// const InstructorModel = require('../../model/Instructors');
// const RescheduleModel = require('../../model/Reschedule');
// const NotificationModel = require('../../model/Notifications');
const AttendanceModel = require('../../models/AttendanceStudent');
const FeedbackModel = require('../../models/StudentFeedback');
const VehicleModel = require('../../models/Vehicle');

// 1. Get All Appointments (for conflict checker, dashboard, etc.)
router.get('/appointments/all', (req, res) => {
  TimeSlotModel.find({})
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: "Server error" }));
});

// 2. Get Student Timeline (registration, bookings, payments, etc.)
router.get('/students/:id/timeline', async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Example timeline data — expand as needed
    const appointments = await TimeSlotModel.find({ studentId: req.params.id });
    const feedback = await FeedbackModel.find({ studentId: req.params.id });

    res.json({ student, appointments, feedback });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. Get Instructor Availability
// router.get('/instructors/availability', (req, res) => {
//   InstructorModel.find({}, 'name availability')
//     .then(data => res.json(data))
//     .catch(err => res.status(500).json({ error: "Server error" }));
// });

// 4. Get Feedback Summary
router.get('/feedback/all', (req, res) => {
  FeedbackModel.find({})
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: "Server error" }));
});

// 5. Mark Attendance
router.put('/attendance/update/:id', (req, res) => {
  AttendanceModel.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .then(att => res.json(att))
    .catch(err => res.status(500).json({ error: "Server error" }));
});

// 6. Get Reschedule Requests
// router.get('/reschedule', (req, res) => {
//   RescheduleModel.find({})
//     .then(data => res.json(data))
//     .catch(err => res.status(500).json({ error: "Server error" }));
// });

// 7. Approve or Reject Reschedule Request
// router.put('/reschedule/:id/approve', (req, res) => {
//   RescheduleModel.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true })
//     .then(data => res.json(data))
//     .catch(err => res.status(500).json({ error: "Server error" }));
// });

// 8. Vehicle Usage Tracker
router.get('/vehicles/status', (req, res) => {
  VehicleModel.find({})
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: "Server error" }));
});

// 9. Notifications: Get All
// router.get('/notifications', (req, res) => {
//   NotificationModel.find({})
//     .then(data => res.json(data))
//     .catch(err => res.status(500).json({ error: "Server error" }));
// });

// 10. Notifications: Mark As Read
// router.put('/notifications/:id/mark-read', (req, res) => {
//   NotificationModel.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
//     .then(data => res.json(data))
//     .catch(err => res.status(500).json({ error: "Server error" }));
// });

// 11. Smart Suggestions (optional hardcoded or AI-driven)
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "10:00 AM Monday is the most preferred slot.",
    "Avoid scheduling on Friday evenings – high cancellation rate.",
    "Angela White has best feedback – schedule peak hours with her."
  ];
  res.json(suggestions);
});

// 12. Search Students (by query param)
router.get('/students/search', (req, res) => {
  const q = req.query.q || "";
  StudentModel.find({ role: 'student', name: { $regex: q, $options: "i" } })
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: "Server error" }));
});

module.exports = router;