const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Video = require('../models/Video');
const VideoProcessor = require('../services/videoProcessor');

const uploadVideo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title } = req.body;
    const ably = req.app.get('ably');

    // Create video record
    const video = await Video.create({
      title: title || req.file.originalname,
      filePath: req.file.path,
      size: req.file.size,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      status: 'processing'
    });

    // Start async processing
    processVideoAsync(video, req.user._id, ably);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully. Processing started...',
      data: { video }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

const processVideoAsync = async (video, userId, ably) => {
  try {
    const processor = new VideoProcessor(ably, video._id.toString(), userId);
    const result = await processor.processVideo(video.filePath, video.filePath);

    // Update video with processing results
    await Video.findByIdAndUpdate(video._id, {
      status: 'completed',
      duration: result.duration,
      thumbnail: result.thumbnail,
      sensitivity: result.sensitivity,
      processingProgress: 100
    });

    // Publish completion event to Ably
    const channel = ably.channels.get(`user-channel`);
    await channel.publish('video-processing-complete', {
      videoId: video._id.toString(),
      status: 'completed'
    });
  } catch (error) {
    console.error('Processing error:', error);
    
    // Update video status to failed
    await Video.findByIdAndUpdate(video._id, {
      status: 'failed',
      processingProgress: 0
    });

    // Publish failure event to Ably
    const channel = ably.channels.get(`user-channel`);
    await channel.publish('video-processing-failed', {
      videoId: video._id.toString(),
      status: 'failed',
      error: error.message
    });
  }
};

const getVideos = async (req, res) => {
  try {
    const { status, sensitivity, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { uploadedBy: req.user._id };
    
    if (status) query.status = status;
    if (sensitivity) query.sensitivity = sensitivity;

    // Pagination
    const skip = (page - 1) * limit;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name email');

    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        videos,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos'
    });
  }
};

const getVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    }).populate('uploadedBy', 'name email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { video }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video'
    });
  }
};

const streamVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Set CORS headers for video streaming
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const videoPath = video.filePath;
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Send entire file if no range header
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error streaming video'
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Promise.all([
      Video.countDocuments({ uploadedBy: userId }),
      Video.countDocuments({ uploadedBy: userId, status: 'processing' }),
      Video.countDocuments({ uploadedBy: userId, sensitivity: 'flagged' }),
      Video.countDocuments({ uploadedBy: userId, status: 'completed' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVideos: stats[0],
        processingVideos: stats[1],
        flaggedVideos: stats[2],
        completedVideos: stats[3]
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
};

const serveThumbnail = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (!video.thumbnail) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    const thumbnailPath = video.thumbnail;
    
    if (!fs.existsSync(thumbnailPath)) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail file not found'
      });
    }

    // Set CORS headers for thumbnails
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Serve the thumbnail file
    res.sendFile(thumbnailPath);
  } catch (error) {
    console.error('Serve thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error serving thumbnail'
    });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideo,
  streamVideo,
  getDashboardStats,
  serveThumbnail
};
