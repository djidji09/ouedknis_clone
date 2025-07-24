const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  searchMessages
} = require('../controllers/messageController');
const {
  validateMessage,
  validateId
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { messageLimiter, generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', authenticateToken, generalLimiter, getConversations);

// @route   GET /api/messages/unread-count
// @desc    Get unread messages count
// @access  Private
router.get('/unread-count', authenticateToken, getUnreadCount);

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search', authenticateToken, generalLimiter, searchMessages);

// @route   GET /api/messages/:userId
// @desc    Get messages between current user and specified user
// @access  Private
router.get('/:userId', authenticateToken, validateId, getMessages);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticateToken, messageLimiter, validateMessage, sendMessage);

// @route   PUT /api/messages/:userId/read
// @desc    Mark messages from a user as read
// @access  Private
router.put('/:userId/read', authenticateToken, validateId, markAsRead);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', authenticateToken, validateId, deleteMessage);

module.exports = router;
