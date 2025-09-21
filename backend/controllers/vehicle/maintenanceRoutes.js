const express = require('express');
const router = express.Router();
const {
  scheduleMaintenance,
  getMaintenanceTasks,
  getMaintenanceTaskById,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  getUpcomingMaintenance,
} = require('../controllers/maintenanceController');

router.route('/')
  .post(scheduleMaintenance)
  .get(getMaintenanceTasks);

router.route('/upcoming')
  .get(getUpcomingMaintenance);

router.route('/:id')
  .get(getMaintenanceTaskById)
  .put(updateMaintenanceTask)
  .delete(deleteMaintenanceTask);

module.exports = router;