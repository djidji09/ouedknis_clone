const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB } = require('./config/db');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Ouedkniss Clone API Server is running!',
    version: '1.0.0',
    api: '/api'
  });
});

// Handle 404 routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📄 API Documentation available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check at http://localhost:${PORT}/api/health`);
});