const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const http = require('http');

const { errorHandler, notFound } = require('./utils/errorHandler');
const authRoutes = require('./routes/authRoutes');
const cookieAuthRoutes = require('./routes/cookieAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatRoomRoutes = require('./routes/chatRoomRoutes');
const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes); // Authentication routes (login, register, logout)
app.use('/api/cookie-auth', cookieAuthRoutes); // Cookie-based authentication routes
app.use('/api/users', userRoutes); // User routes (supports both header and cookie auth)
app.use('/api/messages', messageRoutes); // Message routes (supports both header and cookie auth)
app.use('/api/chat-rooms', chatRoomRoutes); // Chat room routes (supports both header and cookie auth)

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Start server
const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server };
