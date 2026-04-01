import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { videoAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Download,
  Share,
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export const VideoPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const progressBarRef = useRef(null)
  
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    fetchVideo()
  }, [id])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration)
    }

    const handleEnded = () => {
      setPlaying(false)
    }

    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    videoElement.addEventListener('ended', handleEnded)

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.removeEventListener('ended', handleEnded)
    }
  }, [video])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      const response = await videoAPI.getVideo(id)
      setVideo(response.data.data.video)
    } catch (error) {
      console.error('Failed to fetch video:', error)
      toast.error('Failed to load video')
      navigate('/videos')
    } finally {
      setLoading(false)
    }
  }

  const togglePlay = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (playing) {
      videoElement.pause()
    } else {
      videoElement.play()
    }
    setPlaying(!playing)
  }

  const handleProgressClick = (e) => {
    const videoElement = videoRef.current
    const progressBar = progressBarRef.current
    if (!videoElement || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoElement.currentTime = pos * duration
  }

  const handleVolumeChange = (e) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    videoElement.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isMuted) {
      videoElement.volume = volume
      setIsMuted(false)
    } else {
      videoElement.volume = 0
      setIsMuted(true)
    }
  }

  const skip = (seconds) => {
    const videoElement = videoRef.current
    if (!videoElement) return

    videoElement.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSensitivityColor = (sensitivity) => {
    return sensitivity === 'flagged' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Video not found</p>
      </div>
    )
  }

  if (video.status !== 'completed') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/videos')}
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </button>

        <div className="card p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              {getStatusIcon(video.status)}
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Video is {video.status}
              </h3>
              <p className="mt-2 text-gray-600">
                {video.status === 'processing' 
                  ? 'Please wait while we process your video...'
                  : 'There was an error processing this video.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/videos')}
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </button>
        
      
      </div>

      {/* Video Player */}
      <div className="card overflow-hidden">
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            src={videoAPI.getStreamUrl(video._id)}
            className="w-full h-full"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div 
              ref={progressBarRef}
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  {playing ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                {/* Skip Back/Forward */}
                <button
                  onClick={() => skip(-10)}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => skip(10)}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Time */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                {/* Playback Speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value)
                    setPlaybackRate(rate)
                    videoRef.current.playbackRate = rate
                  }}
                  className="bg-gray-800 text-white text-sm rounded px-2 py-1"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary-400 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{video.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(video.status)}`}>
                {getStatusIcon(video.status)}
                <span className="ml-1">{video.status}</span>
              </span>
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSensitivityColor(video.sensitivity)}`}>
                {video.sensitivity}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Uploaded: {new Date(video.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Duration: {formatTime(video.duration)}
              </div>
              
              <div className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                Size: {formatFileSize(video.size)}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Original Filename</p>
                <p className="text-sm text-gray-600 truncate">{video.originalName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">File Type</p>
                <p className="text-sm text-gray-600">{video.mimeType}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Uploaded By</p>
                <p className="text-sm text-gray-600">{video.uploadedBy?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
