const express = require('express');
const { 
  getRoutes, 
  getRoute, 
  createRoute, 
  updateRoute, 
  deleteRoute,
  searchRoutes,
  getRoutesByStation,
  getRouteStats,
  getPopularRoutes,
  bulkUpdateRoutes
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');
const { routeValidation } = require('../middleware/validators');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getRoutes);
router.get('/search', searchRoutes);
router.get('/popular', getPopularRoutes);
router.get('/station/:stationId', getRoutesByStation);
router.get('/:id', getRoute);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));
router.get('/stats', getRouteStats);
router.post('/', routeValidation, handleValidationErrors, createRoute);
router.put('/bulk', bulkUpdateRoutes);
router.put('/:id', routeValidation, handleValidationErrors, updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;

