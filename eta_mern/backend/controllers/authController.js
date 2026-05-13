const User = require('../models/User');
const Route = require('../models/Route');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

// Helper function to generate random password
const generateRandomPassword = () => {
  const length = 12;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password before insert
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid pasword'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token 
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email',
      resetToken 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user by ID (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create busman (Admin only)
// @route   POST /api/auth/busmen
// @access  Private/Admin
const createBusman = async (req, res, next) => {
  try {
    const { fullName, email, phone, routeId } = req.body;

    // Validate route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate random password
    const generatedPassword = generateRandomPassword();

    // Hash password before insert
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

    // Create busman user
    const busman = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: 'busman',
      assignedRoute: routeId
    });

    res.status(201).json({
      success: true,
      message: 'Busman created successfully',
      data: {
        busman,
        credentials: {
          email,
          password: generatedPassword,
          message: 'Please save these credentials. This password will not be displayed again.'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all busmen (Admin only)
// @route   GET /api/auth/busmen
// @access  Private/Admin
const getBusmen = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, route, search } = req.query;

    let query = { role: 'busman' };

    if (route) {
      query.assignedRoute = route;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const busmen = await User.find(query)
      .populate('assignedRoute', 'name code')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: busmen.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: busmen
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get busman by ID (Admin only)
// @route   GET /api/auth/busmen/:id
// @access  Private/Admin
const getBusmanById = async (req, res, next) => {
  try {
    const busman = await User.findOne({
      _id: req.params.id,
      role: 'busman'
    }).populate('assignedRoute', 'name code').select('-password');

    if (!busman) {
      return res.status(404).json({
        success: false,
        message: 'Busman not found'
      });
    }

    res.status(200).json({
      success: true,
      data: busman
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update busman (Admin only)
// @route   PUT /api/auth/busmen/:id
// @access  Private/Admin
const updateBusman = async (req, res, next) => {
  try {
    const { fullName, phone, routeId } = req.body;

    // Validate route exists if provided
    if (routeId) {
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }
    }

    const busman = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'busman' },
      {
        fullName,
        phone,
        ...(routeId && { assignedRoute: routeId })
      },
      { new: true, runValidators: true }
    ).populate('assignedRoute', 'name code').select('-password');

    if (!busman) {
      return res.status(404).json({
        success: false,
        message: 'Busman not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Busman updated successfully',
      data: busman
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete busman (Admin only)
// @route   DELETE /api/auth/busmen/:id
// @access  Private/Admin
const deleteBusman = async (req, res, next) => {
  try {
    const busman = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'busman' },
      { isActive: false },
      { new: true }
    );

    if (!busman) {
      return res.status(404).json({
        success: false,
        message: 'Busman not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Busman deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

