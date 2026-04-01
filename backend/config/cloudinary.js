const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'video-streaming/videos', // Folder name in Cloudinary
    resource_type: 'video', // Specify video resource type
    allowed_formats: ['mp4', 'mov', 'avi', 'quicktime'],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `video-${uniqueSuffix}`;
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, and AVI files are allowed.'), false);
  }
};

// Upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default
    files: 1
  },
  fileFilter
});

// Thumbnail generation function
const generateThumbnail = async (videoPublicId, videoId) => {
  try {
    console.log('Generating thumbnail for videoPublicId:', videoPublicId);
    
    const result = await cloudinary.video(videoPublicId, {
      resource_type: 'video',
      format: 'jpg',
      secure: true,
      transformation: [
        { width: 320, height: 240, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
    
    console.log('Generated thumbnail URL:', result?.secure_url);
    return result?.secure_url || null;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return null;
  }
};

// Delete video from Cloudinary
const deleteVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    return true;
  } catch (error) {
    console.error('Delete video error:', error);
    return false;
  }
};

module.exports = {
  upload,
  cloudinary,
  generateThumbnail,
  deleteVideo
};
