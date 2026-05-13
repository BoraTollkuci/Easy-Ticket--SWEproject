const { body } = require('express-validator');

// Auth validators
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Station validators
const stationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Station name is required')
    .isLength({ max: 100 })
    .withMessage('Station name cannot exceed 100 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Station code is required')
    .isLength({ max: 10 })
    .withMessage('Station code cannot exceed 10 characters')
    .isUppercase()
    .withMessage('Station code must be uppercase'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// Route validators
const routeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Route name is required')
    .isLength({ max: 100 })
    .withMessage('Route name cannot exceed 100 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Route code is required')
    .isLength({ max: 20 })
    .withMessage('Route code cannot exceed 20 characters')
    .isUppercase()
    .withMessage('Route code must be uppercase'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('stations')
    .isArray({ min: 2 })
    .withMessage('Route must have at least 2 stations'),
  
  body('distance')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Distance must be between 0 and 10000 km'),
  
  body('duration')
    .isInt({ min: 0, max: 1440 })
    .withMessage('Duration must be between 0 and 1440 minutes'),
  
  body('fare')
    .isFloat({ min: 0 })
    .withMessage('Fare must be a positive number')
];

// Schedule validators
const scheduleValidation = [
  body('route')
    .isMongoId()
    .withMessage('Invalid route ID'),
  
  body('departureTime')
    .isISO8601()
    .withMessage('Invalid departure time format'),
  
  body('arrivalTime')
    .isISO8601()
    .withMessage('Invalid arrival time format'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'delayed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  
  body('vehicleId')
    .trim()
    .notEmpty()
    .withMessage('Vehicle ID is required'),
  
  body('totalSeats')
    .isInt({ min: 1, max: 500 })
    .withMessage('Total seats must be between 1 and 500'),
  
  body('availableSeats')
    .isInt({ min: 0 })
    .withMessage('Available seats cannot be negative')
];

// Ticket validators
const ticketValidation = [
  body('scheduleId')
    .isMongoId()
    .withMessage('Invalid schedule ID'),
  
  body('passengerName')
    .trim()
    .notEmpty()
    .withMessage('Passenger name is required')
    .isLength({ max: 100 })
    .withMessage('Passenger name cannot exceed 100 characters'),
  
  body('passengerEmail')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('passengerPhone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
  
  body('seatNumber')
    .trim()
    .notEmpty()
    .withMessage('Seat number is required')
    .isLength({ max: 10 })
    .withMessage('Seat number cannot exceed 10 characters'),
  
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'])
    .withMessage('Invalid payment method')
];

module.exports = {
  registerValidation,
  loginValidation,
  stationValidation,
  routeValidation,
  scheduleValidation,
  ticketValidation
};

