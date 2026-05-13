const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for guest bookings
  },
  passengerName: {
    type: String,
    required: [true, 'Passenger name is required'],
    trim: true,
    maxlength: [100, 'Passenger name cannot exceed 100 characters']
  },
  passengerEmail: {
    type: String,
    required: [true, 'Passenger email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  passengerPhone: {
    type: String,
    required: [true, 'Passenger phone is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true,
    uppercase: true,
    maxlength: [10, 'Seat number cannot exceed 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  status: {
    type: String,
    enum: ['reserved', 'confirmed', 'cancelled', 'completed'],
    default: 'reserved'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  cancelledAt: {
    type: Date
  },
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  qrCode: {
    type: String,
    trim: true
  },
  qrCodeData: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ticketSchema.index({ user: 1, purchaseDate: -1 });
ticketSchema.index({ schedule: 1, seatNumber: 1 });
ticketSchema.index({ status: 1 });

// Virtual for ticket number
ticketSchema.virtual('ticketNumber').get(function() {
  return `TK-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Ensure virtual fields are serialized
ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);

