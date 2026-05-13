const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Arrival time is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    trim: true
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1'],
    max: [500, 'Total seats cannot exceed 500']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative']
  },
  assignedBusman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional busman assignment
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validate that arrival time is after departure time
scheduleSchema.pre('save', function(next) {
  if (this.arrivalTime <= this.departureTime) {
    next(new Error('Arrival time must be after departure time'));
  } else {
    next();
  }
});

// Validate that available seats doesn't exceed total seats
scheduleSchema.pre('save', function(next) {
  if (this.availableSeats > this.totalSeats) {
    next(new Error('Available seats cannot exceed total seats'));
  } else {
    next();
  }
});

// Index for efficient queries
scheduleSchema.index({ departureTime: 1, route: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);

