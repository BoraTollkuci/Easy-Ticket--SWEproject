const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [100, 'Route name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Route code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Route code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  stations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  }],
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance must be positive'],
    max: [10000, 'Distance cannot exceed 10000 km']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration must be positive'],
    max: [1440, 'Duration cannot exceed 1440 minutes (24 hours)']
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare must be positive']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validate that stations array has at least 2 stations
routeSchema.pre('save', function(next) {
  if (this.stations.length < 2) {
    next(new Error('Route must have at least 2 stations'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Route', routeSchema);

