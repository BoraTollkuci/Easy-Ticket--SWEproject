const express = require('express');
const {
  getDashboardStats,
  getRevenueByDay,
  getRevenueByRoute,
  getAnalytics,
  getUserStats,
  getSystemHealth,
  getBookingTrends,
  getTopRoutes,
  getRecentActivities
} = require('../controllers/dashboardController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/revenue-by-day', getRevenueByDay);
router.get('/revenue-by-route', getRevenueByRoute);
router.get('/analytics', getAnalytics);
router.get('/users', getUserStats);
router.get('/health', getSystemHealth);
router.get('/booking-trends', getBookingTrends);
router.get('/top-routes', getTopRoutes);
router.get('/recent-activities', getRecentActivities);

module.exports = router;

