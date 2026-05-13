const mongoose = require('mongoose');

const checkInLogSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket reference is required']
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule reference is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route reference is required']
  },
  busman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Busman reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true,
    uppercase: true
  },
  passengerName: {
    type: String,
    required: [true, 'Passenger name is required'],
    trim: true
  },
  passengerEmail: {
    type: String,
    required: [true, 'Passenger email is required'],
    trim: true,
    lowercase: true
  },
  passengerPhone: {
    type: String,
    required: [true, 'Passenger phone is required'],
    trim: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

checkInLogSchema.index({ schedule: 1, route: 1, busman: 1, user: 1, ticket: 1 });

module.exports = mongoose.model('CheckInLog', checkInLogSchema);
