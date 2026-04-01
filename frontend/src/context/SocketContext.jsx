import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useRedux'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [processingVideos, setProcessingVideos] = useState({})
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        newSocket.emit('join-user-room', user._id)
      })

      newSocket.on('video-processing-progress', (data) => {
        setProcessingVideos(prev => ({
          ...prev,
          [data.videoId]: {
            progress: data.progress,
            message: data.message,
            timestamp: data.timestamp
          }
        }))
      })

      newSocket.on('video-processing-complete', (data) => {
        setProcessingVideos(prev => {
          const updated = { ...prev }
          delete updated[data.videoId]
          return updated
        })
      })

      newSocket.on('video-processing-failed', (data) => {
        setProcessingVideos(prev => {
          const updated = { ...prev }
          delete updated[data.videoId]
          return updated
        })
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const value = {
    socket,
    processingVideos,
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
