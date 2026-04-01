const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Ably = require('ably');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();

// Initialize Ably
const ably = new Ably.Realtime(process.env.ABLY_API_KEY);
console.log('Ably initialized with API key:', process.env.ABLY_API_KEY ? 'Present' : 'Missing');

// Ably connection events
ably.connection.on('connected', () => {
  console.log('Ably connected successfully');
});

ably.connection.on('failed', (err) => {
  console.error('Ably connection failed:', err);
});

ably.connection.on('disconnected', () => {
  console.log('Ably disconnected');
});

// Make ably available to routes
app.set('ably', ably);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'", "blob:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
    },
  },
}));
app.use(morgan('combined'));
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set Cross-Origin-Resource-Policy for video files
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/videos')) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
});

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app };
