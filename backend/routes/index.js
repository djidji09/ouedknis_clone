const express = require('express');

// Import route modules
const authRoutes = require('./authRoutes');
const adRoutes = require('./adRoutes');
const categoryRoutes = require('./categoryRoutes');
const messageRoutes = require('./messageRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ouedkniss Clone API is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/ads', adRoutes);
router.use('/categories', categoryRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Ouedkniss Clone API',
    version: '1.0.0',
    endpoints: {
      authentication: '/api/auth',
      ads: '/api/ads',
      categories: '/api/categories',
      messages: '/api/messages',
      users: '/api/users',
      health: '/api/health'
    },
    documentation: 'Visit /api/health for system status'
  });
});

module.exports = router;
