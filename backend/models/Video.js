const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  thumbnail: {
    type: String,
    default: null
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  sensitivity: {
    type: String,
    enum: ['safe', 'flagged'],
    default: 'safe'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: false // For Cloudinary file deletion
  }
}, {
  timestamps: true
});

// Index for faster queries
videoSchema.index({ uploadedBy: 1, createdAt: -1 });
videoSchema.index({ status: 1 });
videoSchema.index({ sensitivity: 1 });

module.exports = mongoose.model('Video', videoSchema);
