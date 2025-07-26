const express = require('express');
const { body, param } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    }
  });
}));

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.product wishlist');

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const fieldsToUpdate = {};
  
  if (req.body.name) fieldsToUpdate.name = req.body.name;
  if (req.body.email) fieldsToUpdate.email = req.body.email;
  if (req.body.avatar) fieldsToUpdate.avatar = req.body.avatar;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
}));

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
router.post('/cart', protect, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const user = await User.findById(req.user.id);

  // Check if product already in cart
  const existingItem = user.cart.find(item => item.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();

  const updatedUser = await User.findById(req.user.id).populate('cart.product');

  res.json({
    success: true,
    message: 'Item added to cart',
    data: updatedUser.cart
  });
}));

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
router.delete('/cart/:productId', protect, [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
  await user.save();

  const updatedUser = await User.findById(req.user.id).populate('cart.product');

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: updatedUser.cart
  });
}));

// @desc    Add/Remove item from wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
router.post('/wishlist/:productId', protect, [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const productId = req.params.productId;

  const isInWishlist = user.wishlist.includes(productId);

  if (isInWishlist) {
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();

  const updatedUser = await User.findById(req.user.id).populate('wishlist');

  res.json({
    success: true,
    message: isInWishlist ? 'Item removed from wishlist' : 'Item added to wishlist',
    data: updatedUser.wishlist
  });
}));

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');

  res.json({
    success: true,
    count: users.length,
    data: users
  });
}));

module.exports = router;
