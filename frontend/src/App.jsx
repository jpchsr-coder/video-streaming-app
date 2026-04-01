import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useRedux'
import { useUI } from './hooks/useRedux'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { VideoLibrary } from './pages/VideoLibrary'
import { VideoPlayer } from './pages/VideoPlayer'
import { UploadComponent } from './pages/Upload'
import { Box, CircularProgress } from '@mui/material'
import { useEffect } from 'react'

function App() {
  const { isAuthenticated, loading } = useAuth()
  const { setLoading } = useUI()

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        // No token, set loading to false immediately
        setLoading('global', false)
        return
      }

      setLoading('global', true)
      try {
        // Token exists, let the auth slice handle validation
        // Just wait a moment for the auth slice to initialize
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading('global', false)
      }
    };

    initializeAuth();
  }, [setLoading]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="videos" element={<VideoLibrary />} />
        <Route path="videos/:id" element={<VideoPlayer />} />
        <Route path="upload" element={<UploadComponent />} />
      </Route>
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
