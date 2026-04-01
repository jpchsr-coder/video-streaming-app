const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Set FFmpeg path to the installed location
ffmpeg.setFfmpegPath('C:\\Users\\rahul\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\Users\\rahul\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffprobe.exe');

class VideoProcessor {
  constructor(ably, videoId, userId) {
    this.ably = ably;
    this.videoId = videoId;
    this.userId = userId;
  }

  async processVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      this.emitProgress(10, 'Starting video processing...');

      // Get video metadata
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          this.emitProgress(0, 'Failed to read video metadata');
          return reject(err);
        }

        const duration = metadata.format.duration;
        this.emitProgress(20, 'Extracting metadata...');

        // Generate thumbnail
        const thumbnailPath = path.join(
          path.dirname(outputPath).replace('videos', 'thumbnails'),
          `thumb-${path.basename(outputPath, path.extname(outputPath))}.jpg`
        );

        // Ensure thumbnails directory exists
        const thumbnailDir = path.dirname(thumbnailPath);
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        ffmpeg(inputPath)
          .screenshots({
            timestamps: ['10%'],
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
            size: '320x240'
          })
          .on('end', () => {
            this.emitProgress(50, 'Thumbnail generated...');
            
            // Simulate sensitivity analysis
            setTimeout(() => {
              this.analyzeSensitivity(inputPath)
                .then(sensitivity => {
                  this.emitProgress(80, 'Sensitivity analysis complete...');
                  
                  // Final processing step
                  setTimeout(() => {
                    this.emitProgress(100, 'Processing complete!');
                    resolve({
                      duration,
                      thumbnail: thumbnailPath,
                      sensitivity
                    });
                  }, 1000);
                })
                .catch(reject);
            }, 1000);
          })
          .on('error', (err) => {
            this.emitProgress(0, 'Thumbnail generation failed');
            reject(err);
          });
      });
    });
  }

  async analyzeSensitivity(videoPath) {
    // Simulate sensitivity analysis
    // In a real application, you might use AI/ML models here
    return new Promise((resolve) => {
      // Simple simulation based on file size or random logic
      const stats = fs.statSync(videoPath);
      const isFlagged = stats.size > 50 * 1024 * 1024 && Math.random() > 0.7;
      
      resolve(isFlagged ? 'flagged' : 'safe');
    });
  }

  async emitProgress(progress, message) {
    try {
      const channel = this.ably.channels.get(`user-${this.userId}`);
      await channel.publish('video-processing-progress', {
        videoId: this.videoId,
        progress,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to emit progress to Ably:', error);
    }
  }
}

module.exports = VideoProcessor;
