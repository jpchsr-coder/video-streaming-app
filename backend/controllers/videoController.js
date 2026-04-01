const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Video = require('../models/Video');
const VideoProcessor = require('../services/videoProcessor');
const { generateThumbnail, deleteVideo } = require('../config/cloudinary');

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

    // Debug: Log the multer-storage-cloudinary response
    console.log('Multer file object:', req.file);
    console.log('File path:', req.file.path);
    console.log('File filename:', req.file.filename);
    console.log('File public_id:', req.file.public_id);

    // Create video record with Cloudinary URL
    const video = await Video.create({
      title: title || req.file.originalname,
      filePath: req.file.path, // Cloudinary URL
      size: req.file.size,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      status: 'processing',
      publicId: req.file.public_id // Cloudinary public_id for deletion
    });

    console.log('Created video record:', video);

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
    if (req.file && req.file.filename) {
      await deleteVideo(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

const processVideoAsync = async (video, userId, ably) => {
  try {
    console.log('Processing video:', video._id, 'publicId:', video.publicId);
    
    const processor = new VideoProcessor(ably, video._id.toString(), userId);
    
    // Generate thumbnail using Cloudinary
    const thumbnailUrl = await generateThumbnail(video.publicId, video._id.toString());
    
    console.log('Generated thumbnail URL:', thumbnailUrl);
    
    // Process video (duration, sensitivity analysis)
    const result = await processor.processVideo(video.filePath, video.filePath);

    // Update video with processing results
    await Video.findByIdAndUpdate(video._id, {
      status: 'completed',
      duration: result.duration,
      thumbnail: thumbnailUrl, // Cloudinary thumbnail URL
      sensitivity: result.sensitivity,
      processingProgress: 100
    });

    console.log('Video processing completed. Thumbnail:', thumbnailUrl);

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
    const { status, sensitivity, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = { uploadedBy: req.user._id };
    
    if (status) query.status = status;
    if (sensitivity) query.sensitivity = sensitivity;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

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

    // For Cloudinary, we can redirect to the video URL
    // Cloudinary handles streaming automatically
    if (video.filePath && video.filePath.includes('cloudinary')) {
      return res.redirect(video.filePath);
    }

    // Fallback for local files (if any)
    const videoPath = video.filePath;
    
    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found:', videoPath);
      return res.status(404).json({
        success: false,
        message: 'Video file not found on server'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Set proper headers for video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
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
    
    const [totalVideos, processingVideos, flaggedVideos, completedVideos, storageResult] = await Promise.all([
      Video.countDocuments({ uploadedBy: userId }),
      Video.countDocuments({ uploadedBy: userId, status: 'processing' }),
      Video.countDocuments({ uploadedBy: userId, sensitivity: 'flagged' }),
      Video.countDocuments({ uploadedBy: userId, status: 'completed' }),
      Video.aggregate([
        { $match: { uploadedBy: userId } },
        { $group: { _id: null, totalSize: { $sum: "$size" } } }
      ])
    ]);

    const totalStorage = storageResult.length > 0 ? storageResult[0].totalSize : 0;

    res.status(200).json({
      success: true,
      data: {
        totalVideos,
        processingVideos,
        flaggedVideos,
        completedVideos,
        totalStorage
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

    // For Cloudinary thumbnails, redirect to the thumbnail URL
    if (video.thumbnail && video.thumbnail.includes('cloudinary')) {
      return res.redirect(video.thumbnail);
    }

    // Fallback for local files (if any)
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
