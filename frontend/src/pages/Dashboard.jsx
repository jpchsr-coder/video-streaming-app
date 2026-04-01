import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useVideos } from '../hooks/useRedux'
import { useSocket } from '../context/SocketContext'
import { 
  Video, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Film,
  TrendingUp
} from 'lucide-react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  Avatar,
  IconButton
} from '@mui/material'

export const Dashboard = () => {
  const { stats, loading, getDashboardStats } = useVideos()
  const { processingVideos, clearProcessingVideo } = useSocket()
console.log("stats----------", stats);

  useEffect(() => {
    getDashboardStats()
  }, [getDashboardStats])

  const statCards = [
    {
      title: 'Total Videos',
      value: stats?.data?.totalVideos || 0,
      icon: Video,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      link: '/videos'
    },
    {
      title: 'Processing',
      value: stats?.data?.processingVideos || 0,
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      link: '/videos?status=processing'
    },
    {
      title: 'Completed',
      value: stats?.data?.completedVideos || 0,
      icon: CheckCircle,
      color: '#22c55e',
      bgColor: '#dcfce7',
      link: '/videos?status=completed'
    },
    {
      title: 'Flagged',
      value: stats?.data?.flaggedVideos || 0,
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: '#fee2e2',
      link: '/videos?sensitivity=flagged'
    }
  ]

  const quickActions = [
    {
      title: 'Upload New Video',
      description: 'Add a new video to your library',
      icon: Upload,
      link: '/upload',
      color: '#3b82f6'
    },
    {
      title: 'View All Videos',
      description: 'Browse your video collection',
      icon: Film,
      link: '/videos',
      color: '#3b82f6'
    }
  ]

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 1
          }}
        >
          Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#64748b' }}
        >
          Welcome back! Here's an overview of your video content.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Link
                to={stat.link}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: stat.bgColor,
                          color: stat.color,
                          mr: 2,
                          width: 56,
                          height: 56
                        }}
                      >
                        <Icon size={28} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: '#64748b', fontWeight: 500 }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, color: '#1e293b' }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          )
        })}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 4, mb: 6, borderRadius: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Grid item xs={12} sm={6} key={index}>
                <Link
                  to={action.link}
                  style={{ textDecoration: 'none' }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: '#f8fafc',
                        borderColor: action.color
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: '#f1f5f9',
                          color: action.color,
                          mr: 3,
                          width: 48,
                          height: 48
                        }}
                      >
                        <Icon size={24} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}
                        >
                          {action.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#64748b' }}
                        >
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Link>
              </Grid>
            )
          })}
        </Grid>
      </Paper>

      {/* System Overview */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}
        >
          System Overview
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              bgcolor: '#f8fafc',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#22c55e',
                  mr: 2,
                  width: 40,
                  height: 40
                }}
              >
                <TrendingUp size={20} />
              </Avatar>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: '#1e293b' }}
              >
                System Status
              </Typography>
            </Box>
            <Chip
              label="Operational"
              size="small"
              sx={{
                bgcolor: '#dcfce7',
                color: '#22c55e',
                fontWeight: 600
              }}
            />
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              bgcolor: '#f8fafc',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: '#dbeafe',
                  color: '#3b82f6',
                  mr: 2,
                  width: 40,
                  height: 40
                }}
              >
                <Film size={20} />
              </Avatar>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: '#1e293b' }}
              >
                Storage Used
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: '#3b82f6', fontWeight: 600 }}
            >
              {stats?.totalVideos || 0} videos
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
