const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserModel = require('../../models/Users');
const PaymentModel = require('../../models/Payment');
const TimeSlotModel = require('../../models/TimeSlot');
const AttendanceModel = require('../../models/AttendanceStudent');
const VehicleModel = require('../../models/Vehicle');
const MockQuestionModel = require('../../models/MockQuestion');

router.post('/registerUser', (req, res) => {
  UserModel.create(req.body)
    .then(user => res.status(201).json(user))
    .catch(err => {
      if (err.code === 11000 && err.keyPattern?.email) {
        return res.status(400).json({ error: "ear:Email already registered" });
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

router.get('/getStudentTimeSlots/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await UserModel.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }
    const timeSlots = await TimeSlotModel.find({ bookedStudents: studentId })
      .populate({ path: 'instructorId', select: 'name email', options: { lean: true } })
      .populate({ path: 'vehicleId', select: 'type model', options: { lean: true } })
      .lean();
    res.json(timeSlots);
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.get('/getAttendance/:studentId', (req, res) => {
  AttendanceModel.find({ studentId: req.params.studentId })
    .populate('timeSlotId', 'startTime endTime')
    .then(records => res.json(records))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

router.get('/getAvailableTimeSlots/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await UserModel.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }
    const timeSlots = await TimeSlotModel.aggregate([
      {$match: {bookedStudents: { $not: { $in: [new mongoose.Types.ObjectId(studentId)] } },date: { $gte: new Date() }}},
      {$addFields: {bookedCount: { $size: '$bookedStudents' }}},
      {$match: {$expr: { $gt: ['$maxCapacity', '$bookedCount'] }}},
      {$lookup: {from: 'vehicles',localField: 'vehicleId',foreignField: '_id',pipeline: [{ $match: { type: { $in: user.licenseType } } },{ $project: { type: 1, model: 1 } }],as: 'vehicleId'}},
      { $unwind: '$vehicleId' },
      {$lookup: {from: 'users',localField: 'instructorId',foreignField: '_id',pipeline: [{ $project: { name: 1, email: 1 } }],as: 'instructorId'}},
      { $unwind: '$instructorId' }
    ]);
    res.json(timeSlots);
  } catch (err) {
    console.error('Error in getAvailableTimeSlots:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.post('/bookTimeSlot/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { studentId } = req.body;

    const user = await UserModel.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    const timeSlot = await TimeSlotModel.findById(slotId);
    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    if (timeSlot.bookedStudents.includes(studentId)) {
      return res.status(400).json({ error: 'Student already booked this slot' });
    }

    if (timeSlot.bookedStudents.length >= timeSlot.maxCapacity) {
      return res.status(400).json({ error: 'Time slot is fully booked' });
    }

    timeSlot.bookedStudents.push(studentId);
    await timeSlot.save();

    res.status(200).json({ message: 'Time slot booked successfully' });
  } catch (err) {
    console.error('Error in bookTimeSlot:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.post('/cancelTimeSlot/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { studentId } = req.body;

    const user = await UserModel.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    const timeSlot = await TimeSlotModel.findById(slotId);
    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    if (!timeSlot.bookedStudents.includes(studentId)) {
      return res.status(400).json({ error: 'Student not booked in this slot' });
    }

    timeSlot.bookedStudents = timeSlot.bookedStudents.filter(id => id.toString() !== studentId);
    await timeSlot.save();

    res.status(200).json({ message: 'Time slot canceled successfully' });
  } catch (err) {
    console.error('Error in cancelTimeSlot:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.get('/getMockQuestions', async (req, res) => {
  try {
    const { level } = req.query;
    const filter = level ? { level } : {};
    const questions = await MockQuestionModel.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions", error: err.message });
  }
});

module.exports = router;