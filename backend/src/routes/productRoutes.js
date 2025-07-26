const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, asyncHandler } = require('../middleware/validation');

// Validation rules
const productValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Electronics', 'Accessories', 'Clothing', 'Books', 'Home', 'Sports', 'Other']).withMessage('Invalid category'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a positive integer')
];

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('sort').optional().isIn(['name', 'price', 'rating', 'createdAt', '-name', '-price', '-rating', '-createdAt']).withMessage('Invalid sort field'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  let query = {};
  
  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }
  
  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Featured products only
  if (req.query.featured === 'true') {
    query.featured = true;
  }
  
  // In stock only
  if (req.query.inStock === 'true') {
    query.inStock = true;
  }

  // Sorting
  let sortBy = {};
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    sortBy[sortField] = sortOrder;
  } else {
    sortBy.createdAt = -1; // Default sort by newest
  }

  const products = await Product.find(query)
    .sort(sortBy)
    .limit(limit)
    .skip(startIndex);

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: products
  });
}));

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid product ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
}));

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), productValidation, handleValidationErrors, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
}));

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid product ID'),
  ...productValidation,
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
}));

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid product ID'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  
  res.json({
    success: true,
    data: categories
  });
}));

module.exports = router;
