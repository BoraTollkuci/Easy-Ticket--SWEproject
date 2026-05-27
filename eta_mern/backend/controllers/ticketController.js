const Ticket = require('../models/Ticket');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const QRCode = require('qrcode');
const { createCheckInEntry } = require('./checkInController');

// Helper function to generate QR code data
const generateQRCodeData = async (ticketId, scheduleId, seatNumber, passengerName) => {
  const qrData = {
    ticketId,
    scheduleId,
    seatNumber,
    passengerName,
    timestamp: new Date().toISOString(),
    type: 'bus_ticket'
  };
  
  const qrCodeString = JSON.stringify(qrData);
  const qrCodeImage = await QRCode.toDataURL(qrCodeString, {
    width: 200,
    margin: 2,
    color: {
      dark: '#002c2b',
      light: '#FFFFFF'
    }
  });
  
  return {
    data: qrCodeString,
    image: qrCodeImage
  };
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const { status, user, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
          // Non-admin users can only see their own tickets
    if (user) {
      query.user = user;
    } else if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

const tickets = await Ticket.find(query)
  .populate({
    path: 'schedule',
    select: 'departureTime arrivalTime vehicleId status route',
    populate: {
      path: 'route',
      select: 'name code fare'
    }
  })
  .populate('user', 'fullName email')
  .sort({ purchaseDate: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    
    // Non-admin users can only see their own tickets
    if (!['admin', 'busman'].includes(req.user.role)) {
      query.user = req.user.id;
    }

    const ticket = await Ticket.findOne(query)
      .populate('schedule', 'departureTime arrivalTime vehicleId status totalSeats availableSeats')
      .populate('schedule.route', 'name code fare duration distance stations')
      .populate('schedule.route.stations', 'name code city state location')
      .populate('user', 'fullName email phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new ticket (guest booking)
// @route   POST /api/tickets/guest
// @access  Public
const createGuestTicket = async (req, res, next) => {
  try {
    const { scheduleId, passengerName, passengerEmail, passengerPhone, seatNumber, paymentMethod, price } = req.body;

    // Check if schedule exists and has available seats
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available seats for this schedule'
      });
    }

    // Check if seat is already taken
    const existingTicket = await Ticket.findOne({
      schedule: scheduleId,
      seatNumber: seatNumber.toUpperCase(),
      status: { $in: ['reserved', 'confirmed'] }
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: 'Seat is already taken'
      });
    }

    // Generate QR code data
    const qrCodeData = await generateQRCodeData(
      null, // We'll update this after ticket creation
      scheduleId,
      seatNumber.toUpperCase(),
      passengerName
    );

    // Create ticket without user (guest booking)
    const ticket = await Ticket.create({
      schedule: scheduleId,
      user: null, // No user for guest booking
      passengerName,
      passengerEmail,
      passengerPhone,
      seatNumber: seatNumber.toUpperCase(),
      price: price || schedule.route.fare,
      paymentMethod,
      status: 'confirmed', // Guest tickets are immediately confirmed
      qrCode: qrCodeData.image,
      qrCodeData: qrCodeData.data
    });

    // Update QR code data with actual ticket ID
    const updatedQrData = await generateQRCodeData(
      ticket._id,
      scheduleId,
      seatNumber.toUpperCase(),
      passengerName
    );
    
    ticket.qrCode = updatedQrData.image;
    ticket.qrCodeData = updatedQrData.data;
    await ticket.save();

    // Update available seats
    await Schedule.findByIdAndUpdate(scheduleId, {
      $inc: { availableSeats: -1 }
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('schedule', 'departureTime arrivalTime vehicleId status')
      .populate('schedule.route', 'name code fare duration distance stations')
      .populate('schedule.route.stations', 'name code city state location');

    res.status(201).json({
      success: true,
      message: 'Guest ticket created successfully',
      data: populatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { scheduleId, passengerName, passengerEmail, passengerPhone, seatNumber, paymentMethod, price } = req.body;

    // Check if schedule exists and has available seats
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available seats for this schedule'
      });
    }

    // Check if seat is already taken
    const existingTicket = await Ticket.findOne({
      schedule: scheduleId,
      seatNumber: seatNumber.toUpperCase(),
      status: { $in: ['reserved', 'confirmed'] }
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: 'Seat is already taken'
      });
    }

    // Generate QR code data
    const qrCodeData = await generateQRCodeData(
      null, // We'll update this after ticket creation
      scheduleId,
      seatNumber.toUpperCase(),
      passengerName
    );

    // Create ticket
    const ticket = await Ticket.create({
      schedule: scheduleId,
      user: req.user.id,
      passengerName,
      passengerEmail,
      passengerPhone,
      seatNumber: seatNumber.toUpperCase(),
      price: price || schedule.route.fare,
      paymentMethod,
      status: 'reserved',
      qrCode: qrCodeData.image,
      qrCodeData: qrCodeData.data
    });

    // Update QR code data with actual ticket ID
    const updatedQrData = await generateQRCodeData(
      ticket._id,
      scheduleId,
      seatNumber.toUpperCase(),
      passengerName
    );
    
    ticket.qrCode = updatedQrData.image;
    ticket.qrCodeData = updatedQrData.data;
    await ticket.save();

    // Update available seats
    await Schedule.findByIdAndUpdate(scheduleId, {
      $inc: { availableSeats: -1 }
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('schedule', 'departureTime arrivalTime vehicleId status')
      .populate('schedule.route', 'name code fare duration distance stations')
      .populate('schedule.route.stations', 'name code city state location')
      .populate('user', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: populatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res, next) => {
  try {
    const { status, paymentStatus, paymentMethod, paymentReference, cancellationReason } = req.body;
    
    let query = { _id: req.params.id };
    
    // Non-admin users can only update their own tickets
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const ticket = await Ticket.findOne(query).populate('schedule');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Handle cancellation
    if (status === 'cancelled') {
      // Restore available seats
      await Schedule.findByIdAndUpdate(ticket.schedule._id, {
        $inc: { availableSeats: 1 }
      });

      ticket.status = 'cancelled';
      ticket.cancelledAt = new Date();
      if (cancellationReason) {
        ticket.cancellationReason = cancellationReason;
      }
      if (paymentStatus) {
        ticket.paymentStatus = paymentStatus;
      }
    } else {
      // Update other fields
      if (status) ticket.status = status;
      if (paymentStatus) ticket.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      ticket.paymentMethod = paymentMethod;
    }

    if (paymentReference !== undefined) {
      ticket.paymentReference = paymentReference;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('schedule', 'departureTime arrivalTime vehicleId status route')
      .populate('schedule.route', 'name code fare duration distance stations')
      .populate('schedule.route.stations', 'name code city state location')
      .populate('user', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm ticket payment
// @route   PUT /api/tickets/:id/confirm
// @access  Private
const confirmTicket = async (req, res, next) => {
  try {
    const { paymentReference } = req.body;

    let query = { _id: req.params.id };
    
    // Non-admin users can only confirm their own tickets
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const ticket = await Ticket.findOne(query);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status !== 'reserved') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not in reserved status'
      });
    }

    ticket.status = 'confirmed';
    ticket.paymentStatus = 'completed';
    if (paymentReference) {
      ticket.paymentReference = paymentReference;
    }

    await ticket.save();

    const confirmedTicket = await Ticket.findById(ticket._id)
      .populate('schedule', 'departureTime arrivalTime vehicleId status route')
      .populate('schedule.route', 'name code fare duration distance stations')
      .populate('schedule.route.stations', 'name code city state location')
      .populate('user', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Ticket confirmed successfully',
      data: confirmedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in a ticket and expire its QR code
// @route   PUT /api/tickets/:id/checkin
// @access  Private (busman, admin)
const checkInTicket = async (req, res, next) => {
  try {
    const { scheduleId } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate('schedule');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Ticket has already been checked in. The QR code is expired.'
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cancelled tickets cannot be checked in.'
      });
    }

    if (scheduleId && ticket.schedule._id.toString() !== scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'This ticket does not belong to the selected schedule.'
      });
    }

    ticket.status = 'completed';
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = req.user.id;

    await ticket.save();

    await createCheckInEntry({ ticket, busman: req.user });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('schedule', 'departureTime arrivalTime vehicleId status route')
      .populate('schedule.route', 'name code fare duration distance stations')
      .populate('schedule.route.stations', 'name code city state location')
      .populate('user', 'fullName email phone');

    res.status(200).json({
      success: true,
      message: 'Ticket checked in successfully. The QR code is now expired.',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }

const tickets = await Ticket.find(query)
  .populate({
    path: 'schedule',
    select: 'departureTime arrivalTime vehicleId status route',
    populate: {
      path: 'route',
      select: 'name code fare duration distance stations',
      populate: {
        path: 'stations',
        select: 'name code city state location'
      }
    }
  })
  .sort({ purchaseDate: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets by schedule
// @route   GET /api/tickets/schedule/:scheduleId
// @access  Private/Admin
const getTicketsBySchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { schedule: scheduleId };
    
    if (status) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'fullName email phone')
      .populate('schedule', 'departureTime arrivalTime vehicleId status route')
      .populate('schedule.route', 'name code description')
      .sort({ purchaseDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private/Admin
const getTicketStats = async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const confirmedTickets = await Ticket.countDocuments({ status: 'confirmed' });
    const cancelledTickets = await Ticket.countDocuments({ status: 'cancelled' });
    const completedTickets = await Ticket.countDocuments({ status: 'completed' });
    const reservedTickets = await Ticket.countDocuments({ status: 'reserved' });
    
    const totalRevenue = await Ticket.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    const todayRevenue = await Ticket.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          purchaseDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        } 
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTickets,
        confirmedTickets,
        cancelledTickets,
        completedTickets,
        reservedTickets,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets by date range
// @route   GET /api/tickets/date-range
// @access  Private/Admin
const getTicketsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    let query = {
      purchaseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (status) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'fullName email phone')
      .populate('schedule', 'departureTime arrivalTime vehicleId')
      .populate('schedule.route', 'name code description')
      .sort({ purchaseDate: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel ticket
// @route   PUT /api/tickets/:id/cancel
// @access  Private
const cancelTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Check if user owns the ticket or is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ticket'
      });
    }
    
    // Check if ticket can be cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already cancelled'
      });
    }
    
    if (ticket.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed ticket'
      });
    }

    // Update ticket status
    ticket.status = 'cancelled';
    ticket.cancellationReason = cancellationReason || 'Cancelled by user';
    ticket.cancelledAt = new Date();
    await ticket.save();

    // Restore seat availability
    const schedule = await Schedule.findById(ticket.schedule);
    if (schedule) {
      schedule.availableSeats += 1;
      await schedule.save();
    }

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund ticket
// @route   PUT /api/tickets/:id/refund
// @access  Private/Admin
const refundTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;
    
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    if (ticket.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled tickets can be refunded'
      });
    }
    
    if (ticket.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already refunded'
      });
    }

    // Update payment status
    ticket.paymentStatus = 'refunded';
    ticket.refundAmount = refundAmount || ticket.price;
    ticket.refundReason = refundReason || 'Admin refund';
    ticket.refundedAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket refunded successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update tickets
// @route   PUT /api/tickets/bulk
// @access  Private/Admin
const bulkUpdateTickets = async (req, res, next) => {
  try {
    const { tickets } = req.body;
    
    if (!Array.isArray(tickets)) {
      return res.status(400).json({
        success: false,
        message: 'Tickets must be an array'
      });
    }

    const updatePromises = tickets.map(ticket => 
      Ticket.findByIdAndUpdate(ticket.id, ticket.data, { new: true })
    );

    const updatedTickets = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `${updatedTickets.length} tickets updated successfully`,
      data: updatedTickets
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
  createGuestTicket,
  updateTicket,
  confirmTicket,
  getMyTickets,
  getTicketsBySchedule,
  getTicketStats,
  getTicketsByDateRange,
  cancelTicket,
  refundTicket,
  checkInTicket,
  bulkUpdateTickets
};