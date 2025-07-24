const express = require('express');
const {
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getMyAds,
  toggleFavorite,
  getFavorites
} = require('../controllers/adController');
const {
  validateAd,
  validateId,
  validatePagination
} = require('../middleware/validation');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { createAdLimiter, generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @route   GET /api/ads
// @desc    Get all ads with filters and pagination
// @access  Public
router.get('/', generalLimiter, validatePagination, optionalAuth, getAds);

// @route   GET /api/ads/my-ads
// @desc    Get current user's ads
// @access  Private
router.get('/my-ads', authenticateToken, validatePagination, getMyAds);

// @route   GET /api/ads/favorites
// @desc    Get current user's favorite ads
// @access  Private
router.get('/favorites', authenticateToken, validatePagination, getFavorites);

// @route   GET /api/ads/:id
// @desc    Get single ad by ID
// @access  Public
router.get('/:id', generalLimiter, validateId, optionalAuth, getAdById);

// @route   POST /api/ads
// @desc    Create new ad
// @access  Private
router.post('/', authenticateToken, createAdLimiter, validateAd, createAd);

// @route   PUT /api/ads/:id
// @desc    Update ad
// @access  Private
router.put('/:id', authenticateToken, validateId, updateAd);

// @route   DELETE /api/ads/:id
// @desc    Delete ad
// @access  Private
router.delete('/:id', authenticateToken, validateId, deleteAd);

// @route   POST /api/ads/:id/favorite
// @desc    Toggle favorite status for an ad
// @access  Private
router.post('/:id/favorite', authenticateToken, validateId, toggleFavorite);

module.exports = router;
