const express = require('express');
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  searchSchedules,
  getSchedulesByRoute,
  getScheduleStats,
  getUpcomingSchedules,
  updateScheduleStatus,
  bulkUpdateSchedules,
  getSeatAvailability,
  getBusmanSchedules
} = require('../controllers/scheduleController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getSchedules);
router.get('/search', searchSchedules);
router.get('/upcoming', getUpcomingSchedules);
router.get('/route/:routeId', getSchedulesByRoute);
router.get('/:id/seats', getSeatAvailability);
router.get('/:id', getSchedule);

// Protected routes
router.use(protect);

// Busman routes
router.get('/busman/my-schedules', authorize('busman'), getBusmanSchedules);

// Admin routes
router.use(authorize('admin'));

router.get('/stats', getScheduleStats);
router.post('/', createSchedule);
router.put('/bulk', bulkUpdateSchedules);
router.put('/:id', updateSchedule);
router.put('/:id/status', updateScheduleStatus);
router.delete('/:id', deleteSchedule);

module.exports = router;

