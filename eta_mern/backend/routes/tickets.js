const express = require('express');
const {
  getTickets,
  getTicket,
  createTicket,
  createGuestTicket,
  updateTicket,
  confirmTicket,
  checkInTicket,
  getMyTickets,
  getTicketsBySchedule,
  getTicketStats,
  getTicketsByDateRange,
  cancelTicket,
  refundTicket,
  bulkUpdateTickets
} = require('../controllers/ticketController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/guest', createGuestTicket);

// All other routes are protected
router.use(protect);

// User routes
router.get('/my-tickets', getMyTickets);
router.post('/', createTicket);
router.get('/:id', getTicket);
router.put('/:id', updateTicket);
router.put('/:id/confirm', confirmTicket);
router.put('/:id/checkin', checkInTicket);
router.put('/:id/cancel', cancelTicket);

// Admin routes
router.use(authorize('admin', 'busman'));
router.get('/', getTickets);
router.get('/stats', getTicketStats);
router.get('/date-range', getTicketsByDateRange);
router.get('/schedule/:scheduleId', getTicketsBySchedule);
router.put('/:id/refund', refundTicket);
router.put('/bulk', bulkUpdateTickets);

module.exports = router;

