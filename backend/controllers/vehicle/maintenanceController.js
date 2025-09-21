const asyncHandler = require('express-async-handler');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle'); // To ensure vehicle exists

// @desc    Schedule a new maintenance task
// @route   POST /api/maintenance
// @access  Private (admin)
const scheduleMaintenance = asyncHandler(async (req, res) => {
  const { vehicleId, taskDescription, scheduleDate } = req.body;

  // Check if the vehicle exists
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const maintenance = await Maintenance.create({
    vehicle: vehicleId,
    taskDescription,
    scheduleDate: new Date(scheduleDate), // Ensure it's a Date object
    status: 'Scheduled', // Default status
  });

  if (maintenance) {
    res.status(201).json(maintenance);
  } else {
    res.status(400);
    throw new Error('Invalid maintenance data');
  }
});

// @desc    Get all maintenance tasks
// @route   GET /api/maintenance
// @access  Private (admin, instructors)
const getMaintenanceTasks = asyncHandler(async (req, res) => {
  const maintenanceTasks = await Maintenance.find({})
    .populate('vehicle', 'vehicleNumber make model'); // Populate vehicle details

  res.json(maintenanceTasks);
});

// @desc    Get maintenance task by ID
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceTaskById = asyncHandler(async (req, res) => {
  const maintenanceTask = await Maintenance.findById(req.params.id)
    .populate('vehicle', 'vehicleNumber make model');

  if (maintenanceTask) {
    res.json(maintenanceTask);
  } else {
    res.status(404);
    throw new Error('Maintenance task not found');
  }
});

// @desc    Update maintenance task details (e.g., mark as complete)
// @route   PUT /api/maintenance/:id
// @access  Private (admin)
const updateMaintenanceTask = asyncHandler(async (req, res) => {
  const maintenanceTask = await Maintenance.findById(req.params.id);

  if (maintenanceTask) {
    maintenanceTask.taskDescription = req.body.taskDescription || maintenanceTask.taskDescription;
    maintenanceTask.scheduleDate = req.body.scheduleDate ? new Date(req.body.scheduleDate) : maintenanceTask.scheduleDate;
    maintenanceTask.status = req.body.status || maintenanceTask.status;
    maintenanceTask.completionDate = req.body.completionDate ? new Date(req.body.completionDate) : maintenanceTask.completionDate;
    maintenanceTask.cost = req.body.cost || maintenanceTask.cost;
    maintenanceTask.notes = req.body.notes || maintenanceTask.notes;
    maintenanceTask.reminderSent = req.body.reminderSent !== undefined ? req.body.reminderSent : maintenanceTask.reminderSent;


    const updatedTask = await maintenanceTask.save();
    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error('Maintenance task not found');
  }
});

// @desc    Delete maintenance task
// @route   DELETE /api/maintenance/:id
// @access  Private (admin)
const deleteMaintenanceTask = asyncHandler(async (req, res) => {
  const maintenanceTask = await Maintenance.findById(req.params.id);

  if (maintenanceTask) {
    await maintenanceTask.deleteOne();
    res.json({ message: 'Maintenance task removed' });
  } else {
    res.status(404);
    throw new Error('Maintenance task not found');
  }
});

// @desc    Get upcoming maintenance tasks (e.g., next 30 days)
// @route   GET /api/maintenance/upcoming
// @access  Private (admin, instructors)
const getUpcomingMaintenance = asyncHandler(async (req, res) => {
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  const upcomingTasks = await Maintenance.find({
    scheduleDate: { $gte: today, $lte: next30Days },
    status: 'Scheduled',
  }).populate('vehicle', 'vehicleNumber make model');

  res.json(upcomingTasks);
});

module.exports = {
  scheduleMaintenance,
  getMaintenanceTasks,
  getMaintenanceTaskById,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  getUpcomingMaintenance,
};