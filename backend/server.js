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
      imgSrc: ["'self'", "data:", "blob:", "https:", "https://res.cloudinary.com"],
      mediaSrc: ["'self'", "blob:", "https:", "https://res.cloudinary.com", "https://video-cloudinary.com"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000",  "https://video-streaming-app-pi-three.vercel.app", "https://video-streaming-app-ud5i.onrender.com", "https://api.cloudinary.com"],
    },
  },
}));
app.use(morgan('combined'));
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://video-streaming-app-pi-three.vercel.app" // 👈 add this
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Add CORS headers for Cloudinary resources
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Allow Cloudinary resources
  if (req.path.includes('/api/videos/') || req.path.includes('/uploads/')) {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
  }
  
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
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
