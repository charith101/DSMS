const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserModel = require('../../model/Users');
const LeaveRequestModel = require('../../model/LeaveRequest');
const TimeSlotModel = require('../../model/TimeSlot');


// verify instructor access
const verifyInstructor = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const user = await UserModel.findById(userId);
    
    if (!user || user.role !== 'instructor') {
      return res.status(403).json({ error: 'Access denied. Instructor access required.' });
    }

    // Attach user to request for use in route handlers
    req.instructor = user;
    next();
  } catch (error) {
    console.error('Instructor verification error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// === EMPLOYEE MANAGEMENT ROUTES (Admin) ===
// Register a new employee (receptionist or instructor)
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

// Get all employees (receptionists and instructors)
router.get('/', (req, res) => {
  UserModel.find({ role: { $in: ['receptionist', 'instructor'] } })
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

// Get employee by ID
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

// Update employee by ID
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

// Delete employee by ID
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

// === GENERAL LEAVE REQUEST ROUTES (Instructor) ===
// Create a new leave request (admin functionality)
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

// Get all leave requests
router.get('/getLeave', (req, res) => {
  LeaveRequestModel.find()
    .populate('staffId', 'name') // Populate the staffId with the name field from UserModel
    .then(leaveRequests => res.json(leaveRequests))
    .catch(err => res.status(500).json({ error: 'Server error' }));
});

// Get leave request by ID
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

// Update leave request
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

// Delete leave request
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

// Update leave request status (admin-specific)
router.put('/updateLeaveStatus/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Pending, Approved, or Rejected' });
  }
  
  LeaveRequestModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  )
    .then(leaveRequest => {
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      return LeaveRequestModel.findById(leaveRequest._id).populate('staffId', 'name');
    })
    .then(populatedLeaveRequest => {
      res.json(populatedLeaveRequest);
    })
    .catch(err => {
      console.error('Error updating leave status:', err);
      res.status(500).json({ error: 'Server error' });
    });
});

// === INSTRUCTOR-SPECIFIC LEAVE ROUTES ===
// Get instructor's own leave requests
router.get('/getMyLeaves/:instructorId', (req, res) => {
  const { instructorId } = req.params;
  
  LeaveRequestModel.find({ staffId: instructorId })
    .populate('staffId', 'name email role')
    .sort({ createdAt: -1 }) // Most recent first
    .then(leaveRequests => {
      res.json(leaveRequests);
    })
    .catch(err => {
      console.error('Error fetching instructor leave requests:', err);
      res.status(500).json({ error: 'Server error' });
    });
});

// Create new leave request for instructor
router.post('/addInstructorLeave', (req, res) => {
  const { startDate, endDate, reason, instructorId } = req.body;
  
  // Validate required fields
  if (!startDate || !endDate || !instructorId) {
    return res.status(400).json({ error: 'Start date, end date, and instructor ID are required' });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Start date cannot be after end date' });
  }

  LeaveRequestModel.create({
    startDate,
    endDate,
    reason: reason || 'No reason provided',
    staffId: instructorId,
    status: 'Pending'
  })
    .then(leaveRequest => {
      // Populate staffId to include name
      return LeaveRequestModel.findById(leaveRequest._id).populate('staffId', 'name email role');
    })
    .then(populatedLeaveRequest => res.status(201).json(populatedLeaveRequest))
    .catch(err => {
      console.error('Leave creation error:', err);
      if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    });
});

// Update instructor's own leave request (only details, not status)
router.put('/updateInstructorLeave/:id', (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, reason } = req.body;
  
  // Only allow updates to startDate, endDate, and reason (not status)
  const updateData = {};
  if (startDate) updateData.startDate = startDate;
  if (endDate) updateData.endDate = endDate;
  if (reason !== undefined) updateData.reason = reason;
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  LeaveRequestModel.findByIdAndUpdate(
    id,
    updateData,
    { runValidators: true, new: true }
  )
    .then(leaveRequest => {
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      // Repopulate staffId after update
      return LeaveRequestModel.findById(leaveRequest._id).populate('staffId', 'name email role');
    })
    .then(populatedLeaveRequest => {
      res.json(populatedLeaveRequest);
    })
    .catch(err => {
      console.error('Error updating instructor leave request:', err);
      if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    });
});

// === INSTRUCTOR-SPECIFIC TIME SLOT ROUTES (Authenticated) ===
router.get('/getTimeSlot/:id', verifyInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.instructor._id;

    const timeSlot = await TimeSlotModel.findOne({ 
      _id: id, 
      instructorId: instructorId // Only return if it belongs to this instructor
    })
    .populate('instructorId', 'name email phone role')
    .populate('vehicleId', 'make model year licensePlate')
    .populate('bookedStudents', 'name email phone');

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found or access denied' });
    }

    res.json(timeSlot);
  } catch (err) {
    console.error('Error fetching time slot details:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get instructor's own time slots (personal timetable)
router.get('/getMyTimeSlots', verifyInstructor, async (req, res) => {
  try {
    const instructorId = req.instructor._id;
    const { date, status } = req.query;
    
    let query = { instructorId };

    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const timeSlots = await TimeSlotModel.find(query)
      .populate('instructorId', 'name email phone role')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('bookedStudents', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    res.json(timeSlots);
  } catch (err) {
    console.error('Error fetching instructor time slots:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === ADMINT TIME SLOT ROUTES ===
// Get all time slots (for admin scheduling)
router.get('/getAllTimeSlots', async (req, res) => {
  try {
    const { date, instructorId, status } = req.query;
    
    let query = {};
    
    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    // Filter by instructor if provided
    if (instructorId) {
      query.instructorId = instructorId;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const timeSlots = await TimeSlotModel.find(query)
      .populate('instructorId', 'name email phone role')
      .populate('vehicleId', 'make model year licensePlate')
      .populate('bookedStudents', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    res.json(timeSlots);
  } catch (err) {
    console.error('Error fetching time slots:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;