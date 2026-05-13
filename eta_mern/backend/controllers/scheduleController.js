const Schedule = require('../models/Schedule');
const Route = require('../models/Route');

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Public
const getSchedules = async (req, res, next) => {
  try {
    const { route, date, status } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (route) {
      query.route = route;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    if (status) {
      query.status = status;
    }

    const schedules = await Schedule.find(query)
      .populate('route', 'name code fare duration distance stations')
      .populate('route.stations', 'name code city')
      .populate('assignedBusman', 'fullName email phone')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Public
const getSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('route', 'name code fare duration distance stations')
      .populate('route.stations', 'name code city state location address')
      .populate('assignedBusman', 'fullName email phone');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private/Admin
const createSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.create(req.body);

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('route', 'name code fare duration distance stations')
      .populate('route.stations', 'name code city')
      .populate('assignedBusman', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: populatedSchedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private/Admin
const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('route', 'name code fare duration distance stations')
      .populate('route.stations', 'name code city')
      .populate('assignedBusman', 'fullName email phone');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search schedules by route and date
// @route   GET /api/schedules/search
// @access  Public
const searchSchedules = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from, to, and date parameters'
      });
    }

    // Find routes that connect the specified stations
    const routes = await Route.find({
      isActive: true,
      stations: { $all: [from, to] }
    }).populate('stations', 'name code');

    if (routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No routes found between the specified stations'
      });
    }

    const routeIds = routes.map(route => route._id);
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const schedules = await Schedule.find({
      route: { $in: routeIds },
      isActive: true,
      departureTime: {
        $gte: searchDate,
        $lt: nextDay
      },
      availableSeats: { $gt: 0 }
    })
      .populate('route', 'name code fare duration distance stations')
      .populate('route.stations', 'name code city')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedules by route
// @route   GET /api/schedules/route/:routeId
// @access  Public
const getSchedulesByRoute = async (req, res, next) => {
  try {
    const { routeId } = req.params;
    const { date, status } = req.query;
    
    let query = { route: routeId, isActive: true };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = { $gte: startDate, $lt: endDate };
    }
    
    if (status) {
      query.status = status;
    }

    const schedules = await Schedule.find(query)
      .populate('route', 'name code description stations fare')
      .populate('route.stations', 'name code city state')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedule statistics
// @route   GET /api/schedules/stats
// @access  Private/Admin
const getScheduleStats = async (req, res, next) => {
  try {
    const totalSchedules = await Schedule.countDocuments();
    const activeSchedules = await Schedule.countDocuments({ isActive: true });
    const scheduledSchedules = await Schedule.countDocuments({ status: 'scheduled' });
    const completedSchedules = await Schedule.countDocuments({ status: 'completed' });
    const cancelledSchedules = await Schedule.countDocuments({ status: 'cancelled' });
    const delayedSchedules = await Schedule.countDocuments({ status: 'delayed' });
    
    const totalSeats = await Schedule.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalSeats' } } }
    ]);
    
    const availableSeats = await Schedule.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$availableSeats' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSchedules,
        activeSchedules,
        inactiveSchedules: totalSchedules - activeSchedules,
        scheduledSchedules,
        completedSchedules,
        cancelledSchedules,
        delayedSchedules,
        totalSeats: totalSeats[0]?.total || 0,
        availableSeats: availableSeats[0]?.total || 0,
        occupiedSeats: (totalSeats[0]?.total || 0) - (availableSeats[0]?.total || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming schedules
// @route   GET /api/schedules/upcoming
// @access  Public
const getUpcomingSchedules = async (req, res, next) => {
  try {
    const { limit = 10, hours = 24 } = req.query;
    const now = new Date();
    const futureTime = new Date(now.getTime() + (parseInt(hours) * 60 * 60 * 1000));
    
    const schedules = await Schedule.find({
      departureTime: { $gte: now, $lte: futureTime },
      isActive: true,
      status: 'scheduled'
    })
    .populate('route', 'name code description stations fare')
    .populate('route.stations', 'name code city state')
    .sort({ departureTime: 1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule status
// @route   PUT /api/schedules/:id/status
// @access  Private/Admin
const updateScheduleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const validStatuses = ['scheduled', 'delayed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: scheduled, delayed, cancelled, completed'
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('route', 'name code description stations fare');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule status updated successfully',
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update schedules
// @route   PUT /api/schedules/bulk
// @access  Private/Admin
const bulkUpdateSchedules = async (req, res, next) => {
  try {
    const { schedules } = req.body;
    
    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'Schedules must be an array'
      });
    }

    const updatePromises = schedules.map(schedule => 
      Schedule.findByIdAndUpdate(schedule.id, schedule.data, { new: true })
    );

    const updatedSchedules = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `${updatedSchedules.length} schedules updated successfully`,
      data: updatedSchedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seat availability for a schedule
// @route   GET /api/schedules/:id/seats
// @access  Public
const getSeatAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get the schedule
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Get all tickets for this schedule
    const Ticket = require('../models/Ticket');
    const occupiedSeats = await Ticket.find({
      schedule: id,
      status: { $in: ['confirmed', 'pending'] }
    }).select('seatNumber');

    const occupiedSeatNumbers = occupiedSeats.map(ticket => ticket.seatNumber);
    
    // Generate all possible seats for this schedule
    const allSeats = [];
    const totalRows = Math.ceil(schedule.totalSeats / 4);

    console.log(schedule)
    
    for (let row = 1; row <= totalRows; row++) {
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${String.fromCharCode(64 + col)}${row}`;
        const seatIndex = (row - 1) * 4 + col - 1;
        
        if (seatIndex < schedule.totalSeats) {
          allSeats.push({
            number: seatNumber,
            index: seatIndex,
            available: !occupiedSeatNumbers.includes(seatNumber)
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        scheduleId: id,
        totalSeats: schedule.totalSeats,
        availableSeats: schedule.availableSeats,
        occupiedSeats: occupiedSeatNumbers,
        seatLayout: allSeats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schedules for logged-in busman
// @route   GET /api/schedules/busman/my-schedules
// @access  Private/Busman
const getBusmanSchedules = async (req, res, next) => {
  try {
    const busmanId = req.user._id;
    
    const schedules = await Schedule.find({
      assignedBusman: busmanId,
      isActive: true
    })
      .populate('route', 'name code fare duration distance stations')
      .populate('route.stations', 'name code city')
      .populate('assignedBusman', 'fullName email phone')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};