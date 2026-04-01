const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadVideo,
  getVideos,
  getVideo,
  streamVideo,
  getDashboardStats,
  serveThumbnail
} = require('../controllers/videoController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const uploadValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty if provided')
];

// Routes
router.post('/upload', 
  authorize('admin', 'editor'), 
  upload.single('video'),
  uploadValidation,
  uploadVideo
);

router.get('/', getVideos);
router.get('/dashboard/stats', getDashboardStats);
router.get('/:id', getVideo);
router.get('/stream/:id', streamVideo);
router.get('/thumbnail/:id', serveThumbnail);

module.exports = router;
