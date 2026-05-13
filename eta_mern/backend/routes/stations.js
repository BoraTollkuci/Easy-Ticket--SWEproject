const express = require('express');
const { 
  getStations, 
  getStation, 
  createStation, 
  updateStation, 
  deleteStation,
  searchStations,
  getStationsByCity,
  getStationStats,
  bulkUpdateStations
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/auth');
const { stationValidation } = require('../middleware/validators');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getStations);
router.get('/search', searchStations);
router.get('/city/:city', getStationsByCity);
router.get('/:id', getStation);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));
router.get('/stats', getStationStats);
router.post('/', stationValidation, handleValidationErrors, createStation);
router.put('/bulk', bulkUpdateStations);
router.put('/:id', stationValidation, handleValidationErrors, updateStation);
router.delete('/:id', deleteStation);

module.exports = router;

