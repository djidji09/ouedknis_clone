const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} = require('../controllers/categoryController');
const {
  validateCategory,
  validateId
} = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', generalLimiter, getCategories);

// @route   GET /api/categories/stats
// @desc    Get category statistics
// @access  Private/Admin
router.get('/stats', authenticateToken, requireAdmin, getCategoryStats);

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id', generalLimiter, validateId, getCategoryById);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/', authenticateToken, requireAdmin, validateCategory, createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', authenticateToken, requireAdmin, validateId, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, validateId, deleteCategory);

module.exports = router;
