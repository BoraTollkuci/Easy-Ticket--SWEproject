const Route = require('../models/Route');
const Station = require('../models/Station');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ isActive: true })
      .populate('stations', 'name code city state location')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
const getRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stations', 'name code city state location address');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private/Admin
const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);

    const populatedRoute = await Route.findById(route._id)
      .populate('stations', 'name code city state location');

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: populatedRoute
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('stations', 'name code city state location');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search routes
// @route   GET /api/routes/search
// @access  Public
const searchRoutes = async (req, res, next) => {
  try {
    const { from, to, minFare, maxFare } = req.query;
    
    let query = { isActive: true };
    
    if (from && to) {
      // Find routes that have both stations
      const fromStation = await Station.findOne({ 
        $or: [
          { code: { $regex: from, $options: 'i' } },
          { city: { $regex: from, $options: 'i' } }
        ]
      });
      
      const toStation = await Station.findOne({ 
        $or: [
          { code: { $regex: to, $options: 'i' } },
          { city: { $regex: to, $options: 'i' } }
        ]
      });
      
      if (fromStation && toStation) {
        query.stations = { $all: [fromStation._id, toStation._id] };
      }
    }
    
    if (minFare || maxFare) {
      query.fare = {};
      if (minFare) query.fare.$gte = parseInt(minFare);
      if (maxFare) query.fare.$lte = parseInt(maxFare);
    }

    const routes = await Route.find(query)
      .populate('stations', 'name code city state location')
      .sort({ fare: 1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get routes by station
// @route   GET /api/routes/station/:stationId
// @access  Public
const getRoutesByStation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    
    const routes = await Route.find({ 
      stations: stationId,
      isActive: true 
    })
    .populate('stations', 'name code city state location')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get route statistics
// @route   GET /api/routes/stats
// @access  Private/Admin
const getRouteStats = async (req, res, next) => {
  try {
    const totalRoutes = await Route.countDocuments();
    const activeRoutes = await Route.countDocuments({ isActive: true });
    
    const avgFare = await Route.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgFare: { $avg: '$fare' } } }
    ]);
    
    const avgDistance = await Route.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgDistance: { $avg: '$distance' } } }
    ]);
    
    const avgDuration = await Route.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRoutes,
        activeRoutes,
        inactiveRoutes: totalRoutes - activeRoutes,
        avgFare: avgFare[0]?.avgFare || 0,
        avgDistance: avgDistance[0]?.avgDistance || 0,
        avgDuration: avgDuration[0]?.avgDuration || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular routes
// @route   GET /api/routes/popular
// @access  Public
const getPopularRoutes = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get routes with most tickets sold
    const popularRoutes = await Route.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'schedules',
          localField: '_id',
          foreignField: 'route',
          as: 'schedules'
        }
      },
      {
        $lookup: {
          from: 'tickets',
          localField: 'schedules._id',
          foreignField: 'schedule',
          as: 'tickets'
        }
      },
      {
        $addFields: {
          ticketCount: { $size: '$tickets' }
        }
      },
      { $sort: { ticketCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'stations',
          localField: 'stations',
          foreignField: '_id',
          as: 'stations'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          description: 1,
          stations: { name: 1, code: 1, city: 1, state: 1 },
          distance: 1,
          duration: 1,
          fare: 1,
          ticketCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: popularRoutes.length,
      data: popularRoutes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update routes
// @route   PUT /api/routes/bulk
// @access  Private/Admin
const bulkUpdateRoutes = async (req, res, next) => {
  try {
    const { routes } = req.body;
    
    if (!Array.isArray(routes)) {
      return res.status(400).json({
        success: false,
        message: 'Routes must be an array'
      });
    }

    const updatePromises = routes.map(route => 
      Route.findByIdAndUpdate(route.id, route.data, { new: true })
    );

    const updatedRoutes = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `${updatedRoutes.length} routes updated successfully`,
      data: updatedRoutes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

