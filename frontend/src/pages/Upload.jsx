import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { videoAPI } from '../services/api'
import { useSocket } from '../context/SocketContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  Upload, 
  X, 
  FileVideo, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

export const UploadComponent = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const navigate = useNavigate()
  const { processingVideos } = useSocket()

  const onDrop = useCallback((acceptedFiles) => {
    const videoFiles = acceptedFiles.filter(file => 
      file.type.startsWith('video/')
    )
    
    if (videoFiles.length === 0) {
      toast.error('Please upload video files only')
      return
    }

    const newFiles = videoFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      title: file.name.replace(/\.[^/.]+$/, ''),
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.quicktime']
    },
    multiple: true,
    disabled: uploading
  })

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileTitle = (id, title) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, title } : f
    ))
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload')
      return
    }

    setUploading(true)
    
    for (const fileItem of files) {
      try {
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: { status: 'uploading', progress: 0 }
        }))

        const formData = new FormData()
        formData.append('video', fileItem.file)
        formData.append('title', fileItem.title)

        const response = await videoAPI.upload(formData)
        const video = response.data.data.video

        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: { status: 'processing', progress: 100 }
        }))

        toast.success(`${fileItem.title} uploaded successfully!`)
        
        // Remove from files list after successful upload
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.id !== fileItem.id))
        }, 2000)

      } catch (error) {
        console.error('Upload error:', error)
        const message = error.response?.data?.message || 'Upload failed'
        
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: { status: 'error', progress: 0, error: message }
        }))
        
        toast.error(`${fileItem.title}: ${message}`)
      }
    }

    setUploading(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <LoadingSpinner size="sm" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileVideo className="w-4 h-4 text-gray-400" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Videos</h1>
        <p className="text-gray-600">Upload and process your video content</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop your videos here' : 'Drag & drop videos here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select files
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: MP4, MOV, AVI (Max 100MB)
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Files to Upload ({files.length})
          </h3>
          
          <div className="space-y-4">
            {files.map(fileItem => {
              const progress = uploadProgress[fileItem.id]
              const processingInfo = processingVideos[progress?.videoId]
              
              return (
                <div key={fileItem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(progress?.status || fileItem.status)}
                        <span className="ml-2 font-medium text-gray-900">
                          {fileItem.title}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Original: {fileItem.file.name}</p>
                        <p>Size: {formatFileSize(fileItem.file.size)}</p>
                      </div>

                      {/* Title Input */}
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={fileItem.title}
                          onChange={(e) => updateFileTitle(fileItem.id, e.target.value)}
                          className="input mt-1"
                          placeholder="Enter video title"
                          disabled={uploading}
                        />
                      </div>

                      {/* Progress */}
                      {progress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              {progress.status === 'uploading' && 'Uploading...'}
                              {progress.status === 'processing' && 'Processing...'}
                              {progress.status === 'error' && 'Error'}
                            </span>
                            {processingInfo && (
                              <span className="text-gray-600">
                                {processingInfo.progress}% - {processingInfo.message}
                              </span>
                            )}
                          </div>
                          
                          {(progress.status === 'uploading' || processingInfo) && (
                            <div className="progress-bar">
                              <div 
                                className="progress-bar-fill"
                                style={{ 
                                  width: `${processingInfo?.progress || progress.progress}%` 
                                }}
                              />
                            </div>
                          )}
                          
                          {progress.error && (
                            <p className="text-sm text-red-600 mt-1">{progress.error}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex items-center space-x-2">
                      {progress?.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/videos/${progress.videoId}`)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      {!uploading && (
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upload Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="btn btn-primary flex items-center"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length} {files.length === 1 ? 'Video' : 'Videos'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing Videos */}
      {Object.keys(processingVideos).length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Currently Processing
          </h3>
          <div className="space-y-3">
            {Object.entries(processingVideos).map(([videoId, info]) => (
              <div key={videoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Processing video...
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-3">
                    {info.progress}%
                  </span>
                  <div className="w-24 progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${info.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
