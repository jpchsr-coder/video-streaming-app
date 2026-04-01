import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Ably from 'ably'
import { useAuth } from '../hooks/useRedux'
import { useDispatch } from 'react-redux'
import { getDashboardStats, fetchVideos } from '../store/slices/videoSlice'
import { videoAPI } from '../services/api'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [ably, setAbly] = useState(null)
  const [videoData, setVideoData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [processingVideos, setProcessingVideos] = useState({})
  const { isAuthenticated, user } = useAuth()
  const dispatch = useDispatch()


   const fetchVideos = async () => {
      try {
        const params = {
          page: 1,
          limit: 12,
        }
        console.log('Fetching videos with params:', params)
        const response = await videoAPI.getVideos(params)
        console.log('Videos API response:', response.data)
        setVideoData(response.data.data)
        
      } catch (error) {
        console.error('Failed to fetch videos:', error)
      } 
    }

  useEffect(() => {
    // Initialize Ably
    const ablyInstance = new Ably.Realtime(import.meta.env.VITE_ABLY_API_KEY || process.env.REACT_APP_ABLY_API_KEY)
    
    // Connection events
    ablyInstance.connection.on('connected', () => {
      console.log('Ably connected successfully')
      setConnectionStatus('connected')
    })

    ablyInstance.connection.on('failed', (err) => {
      console.error('Ably connection failed:', err)
      setConnectionStatus('failed')
    })

    ablyInstance.connection.on('disconnected', () => {
      console.log('Ably disconnected')
      setConnectionStatus('disconnected')
    })

    setAbly(ablyInstance)

    // Cleanup
    return () => {
      ablyInstance.close()
    }
  }, [])

  const fetchStats = async () => {
    try {
      console.log('Dispatching getDashboardStats from SocketContext')
      dispatch(getDashboardStats())
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    if (user && ably) {
      const channel = ably.channels.get(`user-channel`)
      
      // Subscribe to progress updates - trigger video list refresh
      channel.subscribe('video-processing-progress', (message) => {
        console.log('Video processing progress:------------------------', message.data)
        fetchStats()
        fetchVideos()
        // You can show a toast notification here if needed
      })

      // Subscribe to completion - refresh video list
      channel.subscribe('video-processing-complete-------------------', (message) => {
        console.log('Video processing complete:', message.data)
        fetchStats()
        fetchVideos()
        // Trigger video list refresh by dispatching a refresh action
        window.dispatchEvent(new CustomEvent('video-processing-complete', {
          detail: message.data
        }))
      })

      // Subscribe to failures - refresh video list
      channel.subscribe('video-processing-failed', (message) => {
        console.log('Video processing failed:', message.data)
        fetchStats()
        fetchVideos()
        // Trigger video list refresh by dispatching a refresh action
        window.dispatchEvent(new CustomEvent('video-processing-failed', {
          detail: message.data
        }))
      })

      // Return unsubscribe function
      return () => {
        channel.unsubscribe()
      }
    }
  }, [user, ably])

  const value = {
    ably,
    connectionStatus,
    processingVideos,
    videoData,
    clearProcessingVideo: (videoId) => {
      setProcessingVideos(prev => {
        const updated = { ...prev }
        delete updated[videoId]
        return updated
      })
    }
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
