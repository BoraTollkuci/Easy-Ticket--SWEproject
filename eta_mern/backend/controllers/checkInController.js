const CheckInLog = require('../models/CheckInLog');

const createCheckInEntry = async ({ ticket, busman }) => {
  await ticket.populate({
    path: 'schedule',
    populate: { path: 'route', select: 'name code' }
  });

  const routeId = ticket.schedule.route?._id || ticket.schedule.route;

  return CheckInLog.create({
    ticket: ticket._id,
    schedule: ticket.schedule._id,
    route: routeId,
    busman: busman._id,
    user: ticket.user || null,
    seatNumber: ticket.seatNumber,
    passengerName: ticket.passengerName,
    passengerEmail: ticket.passengerEmail,
    passengerPhone: ticket.passengerPhone,
    scannedAt: new Date()
  });
};

const getCheckInLogs = async (req, res, next) => {
  try {
    const { scheduleId, routeId, ticketId, userId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'busman') {
      query.busman = req.user.id;
    }

    if (scheduleId) query.schedule = scheduleId;
    if (routeId) query.route = routeId;
    if (ticketId) query.ticket = ticketId;
    if (userId) query.user = userId;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const logs = await CheckInLog.find(query)
      .populate('ticket', 'seatNumber passengerName passengerEmail passengerPhone status checkedInAt')
      .populate('schedule', 'departureTime arrivalTime vehicleId')
      .populate('route', 'name code')
      .populate('busman', 'fullName email phone')
      .populate('user', 'fullName email phone')
      .sort({ scannedAt: -1 })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);

    const total = await CheckInLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckInEntry,
  getCheckInLogs
};
