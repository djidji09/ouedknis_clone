const express = require('express');
const {
  getUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  resetUserPassword
} = require('../controllers/userController');
const {
  validateId,
  validatePagination,
  handleValidationErrors
} = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, validatePagination, getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticateToken, requireAdmin, getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID (public info only)
// @access  Public
router.get('/:id', generalLimiter, validateId, getUserById);

// @route   GET /api/users/:id/profile
// @desc    Get user's public profile with ads
// @access  Public
router.get('/:id/profile', generalLimiter, validateId, getUserProfile);

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private/Admin
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateId,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('phone')
      .optional()
      .isMobilePhone('ar-DZ')
      .withMessage('Please provide a valid Algerian phone number'),
    
    body('role')
      .optional()
      .isIn(['USER', 'ADMIN'])
      .withMessage('Role must be either USER or ADMIN'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value'),
    
    handleValidationErrors
  ],
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, validateId, deleteUser);

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status (Admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', authenticateToken, requireAdmin, validateId, toggleUserStatus);

// @route   PUT /api/users/:id/reset-password
// @desc    Reset user password (Admin only)
// @access  Private/Admin
router.put('/:id/reset-password',
  authenticateToken,
  requireAdmin,
  validateId,
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    
    handleValidationErrors
  ],
  resetUserPassword
);

module.exports = router;
