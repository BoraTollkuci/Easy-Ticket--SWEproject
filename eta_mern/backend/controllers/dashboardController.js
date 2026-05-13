const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // Get current date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get basic counts
    const totalRoutes = await Route.countDocuments({ isActive: true });
    const activeSchedules = await Schedule.countDocuments({ 
      isActive: true, 
      status: { $in: ['scheduled', 'delayed'] }
    });
    const availableTickets = await Schedule.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$availableSeats' } } }
    ]);

    // Get today's bookings
    const todayBookings = await Ticket.countDocuments({
      purchaseDate: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ['confirmed', 'reserved'] }
    });

    // Get weekly and monthly revenue
    const weeklyRevenue = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfWeek },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    const monthlyRevenue = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfMonth },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    // Get popular routes
    const popularRoutes = await Ticket.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'reserved'] },
          purchaseDate: { $gte: startOfMonth }
        }
      },
      {
        $lookup: {
          from: 'schedules',
          localField: 'schedule',
          foreignField: '_id',
          as: 'scheduleData'
        }
      },
      {
        $lookup: {
          from: 'routes',
          localField: 'scheduleData.route',
          foreignField: '_id',
          as: 'routeData'
        }
      },
      {
        $group: {
          _id: '$routeData.name',
          bookingCount: { $sum: 1 }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get recent transactions
    const recentTransactions = await Ticket.find({
      status: { $in: ['confirmed', 'reserved', 'cancelled'] }
    })
      .populate('user', 'fullName')
      .sort({ purchaseDate: -1 })
      .limit(10)
      .select('passengerName price purchaseDate status paymentStatus');

    const stats = {
      totalRoutes,
      activeSchedules,
      availableTickets: availableTickets[0]?.total || 0,
      todayBookings,
      weeklyRevenue: weeklyRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      popularRoutes: popularRoutes.map(route => ({
        routeName: route._id[0] || 'Unknown Route',
        bookingCount: route.bookingCount
      })),
      recentTransactions: recentTransactions.map(ticket => ({
        id: ticket._id,
        customerName: ticket.passengerName,
        amount: ticket.price,
        date: ticket.purchaseDate,
        status: ticket.paymentStatus
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by day for the last 7 days
// @route   GET /api/dashboard/revenue-by-day
// @access  Private/Admin
const getRevenueByDay = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const revenueByDay = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startDate },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' }
          },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formattedData = revenueByDay.map(item => ({
      date: item._id,
      revenue: item.revenue
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by route for the current month
// @route   GET /api/dashboard/revenue-by-route
// @access  Private/Admin
const getRevenueByRoute = async (req, res, next) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueByRoute = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfMonth },
          paymentStatus: 'completed'
        }
      },
      {
        $lookup: {
          from: 'schedules',
          localField: 'schedule',
          foreignField: '_id',
          as: 'scheduleData'
        }
      },
      {
        $lookup: {
          from: 'routes',
          localField: 'scheduleData.route',
          foreignField: '_id',
          as: 'routeData'
        }
      },
      {
        $group: {
          _id: '$routeData.name',
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    const formattedData = revenueByRoute.map(item => ({
      routeName: item._id[0] || 'Unknown Route',
      revenue: item.revenue
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking analytics
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    startDate.setHours(0, 0, 0, 0);

    // Booking trends
    const bookingTrends = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startDate },
          status: { $in: ['confirmed', 'reserved'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$purchaseDate' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Status distribution
    const statusDistribution = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const analytics = {
      bookingTrends: bookingTrends.map(item => ({
        date: item._id,
        bookings: item.bookings,
        revenue: item.revenue
      })),
      paymentMethods: paymentMethods.map(item => ({
        method: item._id,
        count: item.count
      })),
      statusDistribution: statusDistribution.map(item => ({
        status: item._id,
        count: item.count
      }))
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/dashboard/users
// @access  Private/Admin
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers,
        newUsersToday,
        newUsersThisWeek
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health
// @route   GET /api/dashboard/health
// @access  Private/Admin
const getSystemHealth = async (req, res, next) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Recent activity
    const recentTickets = await Ticket.countDocuments({
      purchaseDate: { $gte: oneHourAgo }
    });
    
    const recentSchedules = await Schedule.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });
    
    // Database status
    const dbStats = {
      users: await User.countDocuments(),
      stations: await Station.countDocuments(),
      routes: await Route.countDocuments(),
      schedules: await Schedule.countDocuments(),
      tickets: await Ticket.countDocuments()
    };
    
    // System metrics
    const systemHealth = {
      database: 'connected',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      recentActivity: {
        tickets: recentTickets,
        schedules: recentSchedules
      },
      databaseStats: dbStats,
      lastChecked: now
    };

    res.status(200).json({
      success: true,
      data: systemHealth
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking trends
// @route   GET /api/dashboard/booking-trends
// @access  Private/Admin
const getBookingTrends = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '24h':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const trends = await Ticket.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' },
            day: { $dayOfMonth: '$purchaseDate' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        trends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top performing routes
// @route   GET /api/dashboard/top-routes
// @access  Private/Admin
const getTopRoutes = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const topRoutes = await Route.aggregate([
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
          totalBookings: { $size: '$tickets' },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$tickets',
                as: 'ticket',
                in: { $cond: [{ $eq: ['$$ticket.status', 'confirmed'] }, '$$ticket.price', 0] }
              }
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } },
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
          stations: { name: 1, code: 1, city: 1 },
          distance: 1,
          duration: 1,
          fare: 1,
          totalBookings: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: topRoutes.length,
      data: topRoutes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private/Admin
const getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    const recentTickets = await Ticket.find({})
      .populate('user', 'fullName email')
      .populate('schedule', 'departureTime vehicleId')
      .populate('schedule.route', 'name code')
      .sort({ purchaseDate: -1 })
      .limit(parseInt(limit));

    const activities = recentTickets.map(ticket => ({
      type: 'booking',
      user: ticket.user.fullName,
      userEmail: ticket.user.email,
      description: `Booked ticket for ${ticket.schedule.route.name}`,
      amount: ticket.price,
      status: ticket.status,
      date: ticket.purchaseDate,
      ticketId: ticket._id
    }));

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueByDay,
  getRevenueByRoute,
  getAnalytics,
  getUserStats,
  getSystemHealth,
  getBookingTrends,
  getTopRoutes,
  getRecentActivities
};