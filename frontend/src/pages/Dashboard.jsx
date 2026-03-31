import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { videoAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  Video, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Film,
  TrendingUp
} from 'lucide-react'

export const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await videoAPI.getDashboardStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Videos',
      value: stats?.totalVideos || 0,
      icon: Video,
      color: 'bg-blue-500',
      link: '/videos'
    },
    {
      title: 'Processing',
      value: stats?.processingVideos || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/videos?status=processing'
    },
    {
      title: 'Completed',
      value: stats?.completedVideos || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/videos?status=completed'
    },
    {
      title: 'Flagged',
      value: stats?.flaggedVideos || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/videos?sensitivity=flagged'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your video content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              to={stat.link}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/upload"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-primary-600 mr-4" />
            <div>
              <h3 className="font-medium text-gray-900">Upload New Video</h3>
              <p className="text-sm text-gray-600">Add a new video to your library</p>
            </div>
          </Link>
          
          <Link
            to="/videos"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Film className="w-8 h-8 text-primary-600 mr-4" />
            <div>
              <h3 className="font-medium text-gray-900">View All Videos</h3>
              <p className="text-sm text-gray-600">Browse your video collection</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">System Status</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Film className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Storage Used</span>
            </div>
            <span className="text-sm text-blue-600 font-medium">
              {stats?.totalVideos || 0} videos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
