const express = require('express');
const router = express.Router();
const UserModel = require('../../models/Users');
const TimeSlotModel = require('../../models/TimeSlot');
const AttendanceStudentModel = require('../../models/AttendanceStudent');
const AttendanceStaffModel = require('../../models/AttendanceStaff');
const VehicleModel = require('../../models/Vehicle');
const mongoose = require('mongoose');

// Verify receptionist access
const verifyReceptionist = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const user = await UserModel.findById(userId);
    
    if (!user || user.role !== 'receptionist') {
      return res.status(403).json({ error: 'Access denied. Receptionist access required.' });
    }

    req.receptionist = user;
    next();
  } catch (error) {
    console.error('Receptionist verification error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Book new appointment (single or recurring)
router.post('/bookAppointment', verifyReceptionist, async (req, res) => {
  const { studentName, instructorName, date, time, recurring, weeks, vehicleId } = req.body;
  
  if (!studentName || !instructorName || !date || !time || !vehicleId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const student = await UserModel.findOne({ name: studentName, role: 'student' });
    const instructor = await UserModel.findOne({ name: instructorName, role: 'instructor' });
    
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!instructor) return res.status(404).json({ error: 'Instructor not found' });

    const startTime = time;
    const endTime = new Date(new Date(`1970-01-01T${time}:00`).getTime() + 60*60*1000).toISOString().slice(11, 16);

    let currentDate = new Date(date);
    const bookedSlots = [];

    for (let i = 0; i < (recurring ? weeks : 1); i++) {
      let timeSlot = await TimeSlotModel.findOne({
        date: currentDate,
        startTime,
        instructorId: instructor._id
      });

      if (!timeSlot) {
        timeSlot = await TimeSlotModel.create({
          date: currentDate,
          startTime,
          endTime,
          status: 'active',
          instructorId: instructor._id,
          vehicleId,
          bookedStudents: [],
          maxCapacity: 1
        });
      }

      if (timeSlot.bookedStudents.length >= timeSlot.maxCapacity) {
        return res.status(400).json({ error: `Slot full on ${currentDate.toISOString().split('T')[0]}` });
      }

      if (timeSlot.bookedStudents.includes(student._id)) {
        return res.status(400).json({ error: `Student already booked on ${currentDate.toISOString().split('T')[0]}` });
      }

      timeSlot.bookedStudents.push(student._id);
      await timeSlot.save();
      bookedSlots.push(timeSlot);

      if (recurring) {
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    res.status(201).json({ message: 'Appointment(s) booked', slots: bookedSlots });
  } catch (err) {
    console.error('Appointment booking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get upcoming appointments
router.get('/upcomingAppointments', verifyReceptionist, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeSlots = await TimeSlotModel.find({ date: { $gte: today } })
      .populate('bookedStudents', 'name')
      .populate('instructorId', 'name')
      .sort({ date: 1, startTime: 1 });

    const appointments = timeSlots.flatMap(slot => 
      slot.bookedStudents.map(student => ({
        time: slot.startTime,
        student: student.name,
        instructor: slot.instructorId.name
      }))
    );

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching upcoming appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send reminder
router.post('/sendReminder', verifyReceptionist, (req, res) => {
  const { studentName } = req.body;
  console.log(`Reminder sent to ${studentName}`);
  res.json({ message: `Reminder sent to ${studentName}` });
});

// Get students for attendance
router.get('/studentsForAttendance', verifyReceptionist, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeSlots = await TimeSlotModel.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('bookedStudents', 'name');

    const students = [...new Set(timeSlots.flatMap(slot => 
      slot.bookedStudents.map(student => ({
        name: student.name,
        status: 'present'
      }))
    ))];

    res.json(students);
  } catch (err) {
    console.error('Error fetching students for attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark or update student attendance
router.put('/markAttendance', verifyReceptionist, async (req, res) => {
  const { studentName, status, timeSlotId } = req.body;

  if (!studentName || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const student = await UserModel.findOne({ name: studentName, role: 'student' });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const attendance = await AttendanceStudentModel.findOneAndUpdate(
      { studentId: student._id, timeSlotId: timeSlotId || { $exists: false } },
      { status, markedBy: req.receptionist._id, date: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(attendance);
  } catch (err) {
    console.error('Attendance marking error:', err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get class schedule
router.get('/classSchedule', verifyReceptionist, async (req, res) => {
  try {
    const timeSlots = await TimeSlotModel.find({})
      .populate('instructorId', 'name')
      .sort({ date: 1 });

    const classes = timeSlots.map(slot => ({
      day: new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' }),
      time: `${slot.startTime} - ${slot.endTime}`,
      topic: 'Driving Practice'
    }));

    res.json(classes);
  } catch (err) {
    console.error('Error fetching class schedule:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search students
router.get('/searchStudents', verifyReceptionist, async (req, res) => {
  const { query } = req.query;
  let searchQuery = { role: 'student' };
  if (query) {
    searchQuery.name = { $regex: query, $options: 'i' };
  }

  try {
    const students = await UserModel.find(searchQuery).select('name email age nic licenseType level');
    res.json(students);
  } catch (err) {
    console.error('Error searching students:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students
router.get('/students', verifyReceptionist, async (req, res) => {
  try {
    const students = await UserModel.find({ role: 'student' }).select('name');
    const formatted = students.map(s => ({ name: s.name, status: 'Active' }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student timeline
router.get('/studentTimeline/:studentName', verifyReceptionist, async (req, res) => {
  const { studentName } = req.params;

  try {
    const student = await UserModel.findOne({ name: studentName, role: 'student' });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const attendances = await AttendanceStudentModel.find({ studentId: student._id }).sort({ date: 1 });

    const timeline = [
      { label: 'Registered', date: student.createdAt.toISOString().split('T')[0] },
      ...attendances.map(a => ({
        label: `Class Attended - ${a.status}`,
        date: a.date.toISOString().split('T')[0]
      }))
    ];

    res.json(timeline);
  } catch (err) {
    console.error('Error fetching student timeline:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's overview stats
router.get('/todayOverview', verifyReceptionist, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeSlots = await TimeSlotModel.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const appointments = timeSlots.length;
    const students = new Set(timeSlots.flatMap(t => t.bookedStudents)).size;
    const classes = appointments;
    const cancellations = 0;

    res.json({ appointments, students, classes, cancellations });
  } catch (err) {
    console.error('Error fetching today overview:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get smart suggestions
router.get('/smartSuggestions', verifyReceptionist, (req, res) => {
  const suggestions = [
    "10:00 AM Monday is the most preferred slot.",
    "Avoid scheduling on Friday evenings – high cancellation rate.",
    "Angela White has best feedback – schedule peak hours with her."
  ];
  res.json(suggestions);
});

// Get vehicle usage
router.get('/vehicleUsage', verifyReceptionist, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeSlots = await TimeSlotModel.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('vehicleId', 'vehicleNumber');

    const vehicles = await VehicleModel.find({}).select('vehicleNumber');

    const usage = vehicles.map(v => {
      const slot = timeSlots.find(s => s.vehicleId && s.vehicleId._id.toString() === v._id.toString());
      return {
        name: v.vehicleNumber,
        status: slot ? 'In Use' : 'Free',
        time: slot ? `${slot.startTime} - ${slot.endTime}` : '—'
      };
    });

    res.json(usage);
  } catch (err) {
    console.error('Error fetching vehicle usage:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile
router.get('/profile', verifyReceptionist, async (req, res) => {
try {
const user = await UserModel.findById(req.receptionist._id).select('name email phone address');
if (!user) return res.status(404).json({ error: 'Profile not found' });
res.json(user);
} catch (err) {
console.error('Error fetching profile:', err);
res.status(500).json({ error: 'Server error' });
}
});

// Update profile
router.put('/profile', verifyReceptionist, async (req, res) => {
const { name, email, phone, address } = req.body;

if (!name || !email) {
return res.status(400).json({ error: 'Name and email are required' });
}

try {
const updated = await UserModel.findByIdAndUpdate(
req.receptionist._id,
{ name, email, phone, address },
{ new: true, runValidators: true }
).select('name email phone address');

if (!updated) return res.status(404).json({ error: 'Profile not found' });
res.json(updated);
} catch (err) {
console.error('Profile update error:', err);
if (err.name === 'ValidationError') {
res.status(400).json({ error: err.message });
} else {
res.status(500).json({ error: 'Server error' });
}
}
});

module.exports = router;