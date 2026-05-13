const Station = require('../models/Station');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public
const getStations = async (req, res, next) => {
  try {
    const stations = await Station.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
const getStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new station
// @route   POST /api/stations
// @access  Private/Admin
const createStation = async (req, res, next) => {
  try {
    const station = await Station.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Station created successfully',
      data: station
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private/Admin
const updateStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: station
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
const deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Station deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search stations
// @route   GET /api/stations/search
// @access  Public
const searchStations = async (req, res, next) => {
  try {
    const { q, city, state } = req.query;
    
    let query = { isActive: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    const stations = await Station.find(query)
      .sort({ name: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stations by city
// @route   GET /api/stations/city/:city
// @access  Public
const getStationsByCity = async (req, res, next) => {
  try {
    const { city } = req.params;
    
    const stations = await Station.find({ 
      city: { $regex: city, $options: 'i' },
      isActive: true 
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get station statistics
// @route   GET /api/stations/stats
// @access  Private/Admin
const getStationStats = async (req, res, next) => {
  try {
    const totalStations = await Station.countDocuments();
    const activeStations = await Station.countDocuments({ isActive: true });
    const cities = await Station.distinct('city');
    const states = await Station.distinct('state');

    res.status(200).json({
      success: true,
      data: {
        totalStations,
        activeStations,
        inactiveStations: totalStations - activeStations,
        totalCities: cities.length,
        totalStates: states.length,
        cities,
        states
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update stations
// @route   PUT /api/stations/bulk
// @access  Private/Admin
const bulkUpdateStations = async (req, res, next) => {
  try {
    const { stations } = req.body;
    
    if (!Array.isArray(stations)) {
      return res.status(400).json({
        success: false,
        message: 'Stations must be an array'
      });
    }

    const updatePromises = stations.map(station => 
      Station.findByIdAndUpdate(station.id, station.data, { new: true })
    );

    const updatedStations = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `${updatedStations.length} stations updated successfully`,
      data: updatedStations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  searchStations,
  getStationsByCity,
  getStationStats,
  bulkUpdateStations
};

