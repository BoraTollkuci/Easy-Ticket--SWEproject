const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  createBusman,
  getBusmen,
  getBusmanById,
  updateBusman,
  deleteBusman
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Admin routes - User management
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUserById);
router.delete('/users/:id', protect, authorize('admin'), deleteUserById);

// Admin routes - Busman management
router.post('/busmen', protect, authorize('admin'), createBusman);
router.get('/busmen', protect, authorize('admin'), getBusmen);
router.get('/busmen/:id', protect, authorize('admin'), getBusmanById);
router.put('/busmen/:id', protect, authorize('admin'), updateBusman);
router.delete('/busmen/:id', protect, authorize('admin'), deleteBusman);

module.exports = router;

