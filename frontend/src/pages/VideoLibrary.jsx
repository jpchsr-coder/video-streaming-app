import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { videoAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useSocket } from '../context/SocketContext'

import { 
  Video, 
  Filter, 
  Search,
  Grid3X3,
  List,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calendar,
  FileText,
  X
} from 'lucide-react'

export const VideoLibrary = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [filters, setFilters] = useState({
    status: '',
    sensitivity: '',
    search: ''
  })
  const {videoData} = useSocket()
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    count: 0
  })
  const [searchInput, setSearchInput] = useState('')

  // Debounced search function with proper cleanup
  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim()) {
        setFilters(prev => ({ ...prev, search: searchInput }))
        setPagination(prev => ({ ...prev, current: 1 }))
      } else {
        // Clear search when input is empty
        setFilters(prev => ({ ...prev, search: '' }))
        setPagination(prev => ({ ...prev, current: 1 }))
      }
    }, 800) // Increased delay to reduce API calls
    
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const cleanup = debouncedSearch()
    return cleanup
  }, [debouncedSearch])

  useEffect(() => {
    fetchVideos()
  }, [filters, pagination.current])


  useEffect(() => {
    console.log('Video data updated:', videoData)
    if(videoData?.videos) {
      setVideos(videoData.videos)
      setPagination({
        current: videoData.pagination.current,
        total: videoData.pagination.total,
        count: videoData.pagination.count
      })
    }
  }, [videoData])



  const fetchVideos = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      }
      
      console.log('Fetching videos with params:', params)
      const response = await videoAPI.getVideos(params)
      console.log('Videos API response:', response.data)
      setVideos(response.data.data.videos)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSearchChange = (value) => {
    setSearchInput(value)
    if (!value.trim()) {
      setFilters(prev => ({ ...prev, search: '' }))
      setPagination(prev => ({ ...prev, current: 1 }))
    }
  }

  const hasActiveFilters = filters.status || filters.sensitivity || filters.search

  const clearSearch = () => {
    setSearchInput('')
    setFilters(prev => ({ ...prev, search: '' }))
    setPagination(prev => ({ ...prev, current: 1 }))
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const VideoCard = ({ video }) => {
    console.log("video", video);
    
    return(<div className="card overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
       {video.thumbnail ? (
  <img
    src={video.thumbnail}
    alt={video.title}
    className="w-full h-full object-cover"
  />
) : video.filePath ? (
  <video
    src={video.filePath}
    className="w-full h-full object-cover"
    muted
    preload="metadata"
  />
) : (
  <div className="w-full h-full flex items-center justify-center">
    <Video className="w-12 h-12 text-gray-400" />
  </div>
)}
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
            {getStatusIcon(video.status)}
            <span className="ml-1">{video.status}</span>
          </span>
        </div>

        {/* Sensitivity Badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSensitivityColor(video.sensitivity)}`}>
            {video.sensitivity}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-2">
          {video.title}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(video.createdAt).toLocaleDateString()}
          </div>
          
          {video.duration > 0 && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDuration(video.duration)}
            </div>
          )}
          
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            {formatFileSize(video.size)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/videos/${video._id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </Link>
          
          {video.status === 'completed' && (
            <Link
              to={`/videos/${video._id}`}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Play
            </Link>
          )}
        </div>
      </div>
    </div>)
  }

  const VideoListItem = ({ video }) => (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-24 h-16 bg-gray-200 rounded overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {video.title}
              </h3>
              
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                {video.duration > 0 && (
                  <span>{formatDuration(video.duration)}</span>
                )}
                <span>{formatFileSize(video.size)}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2 ml-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(video.status)}`}>
                {getStatusIcon(video.status)}
                <span className="ml-1">{video.status}</span>
              </span>
              
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSensitivityColor(video.sensitivity)}`}>
                {video.sensitivity}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <Link
            to={`/videos/${video._id}`}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <Eye className="w-4 h-4" />
          </Link>
          
          {video.status === 'completed' && (
            <Link
              to={`/videos/${video._id}`}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
          <p className="text-gray-600">
            {pagination.count} {pagination.count === 1 ? 'video' : 'videos'} found
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
     <div className="card p-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
    
    {/* Search */}
    <div className="relative col-span-1 sm:col-span-2">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search videos..."
        className="input pl-10 pr-10 w-full"
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {searchInput && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>

    {/* Status Filter */}
    <select
      className="input w-full"
      value={filters.status}
      onChange={(e) => handleFilterChange('status', e.target.value)}
    >
      <option value="">All Status</option>
      <option value="processing">Processing</option>
      <option value="completed">Completed</option>
      <option value="failed">Failed</option>
    </select>

    {/* Sensitivity Filter */}
    <select
      className="input w-full"
      value={filters.sensitivity}
      onChange={(e) => handleFilterChange('sensitivity', e.target.value)}
    >
      <option value="">All Sensitivity</option>
      <option value="safe">Safe</option>
      <option value="flagged">Flagged</option>
    </select>

    {/* Clear Button */}
    {hasActiveFilters && (
      <button
        onClick={() => {
          setFilters({ status: '', sensitivity: '', search: '' })
          setSearchInput('')
          setPagination({ ...pagination, current: 1 })
        }}
        className="btn btn-secondary w-full flex items-center justify-center"
      >
        <Filter className="w-4 h-4 mr-2" />
        Clear
      </button>
    )}

  </div>
</div>

      {/* Videos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status || filters.sensitivity
              ? 'Try adjusting your filters'
              : 'Get started by uploading your first video'
            }
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map(video => (
                <VideoListItem key={video._id} video={video} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.current} of {pagination.total}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.total}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
