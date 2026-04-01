import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useRedux'
import { useUI } from '../hooks/useRedux'
import { 
  Home, 
  Video, 
  Upload, 
  Menu, 
  X,
} from 'lucide-react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'

const drawerWidth = 280

export const Layout = () => {
  const { user, logout } = useAuth()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUI()
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
 console.log('User:', user)
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Video Library', href: '/videos', icon: Video },
    ...(user?.role === 'admin' || user?.role === 'editor' ? [
      { name: 'Upload', href: '/upload', icon: Upload }
    ] : [])
  ]

  const isActive = (href) => {
    return location.pathname === href
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Video App
          </Typography>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(false)} sx={{ color: '#64748b' }}>
              <X size={20} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive(item.href) ? '#f1f5f9' : 'transparent',
                    color: isActive(item.href) ? '#3b82f6' : '#64748b',
                    '&:hover': {
                      backgroundColor: isActive(item.href) ? '#f1f5f9' : '#f8fafc',
                      color: '#1e293b'
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive(item.href) ? '#3b82f6' : '#64748b'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.name}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.href) ? 600 : 500
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: '#3b82f6',
              width: 40,
              height: 40,
              mr: 2
            }}
          >
          Person
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
        
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 2,
            color: '#ef4444',
            '&:hover': {
              backgroundColor: '#fee2e2'
            },
            '& .MuiListItemIcon-root': {
              color: '#ef4444'
            }
          }}
        >
         
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isMobile && sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid #e2e8f0'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid #e2e8f0',
            position: 'fixed',
            height: '100vh',
            overflow: 'hidden',
            top: 0,
            left: 0,
            zIndex: 1100
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          marginLeft: { lg: `${drawerWidth}px` }
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          sx={{
            bgcolor: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleSidebar}
              sx={{ mr: 2, display: { lg: 'none' } }}
            >
              <Menu size={24} />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'block', lg: 'none' } }}>
              {navigation.find(item => isActive(item.href))?.name || 'Video App'}
            </Typography>

            {/* Mobile User Menu */}
            {isMobile && (
              <Avatar
                sx={{
                  bgcolor: '#3b82f6',
                  width: 32,
                  height: 32
                }}
              >
               Person
              </Avatar>
            )}
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        {/* <Toolbar /> Spacer for fixed AppBar */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 64px)' // Subtract AppBar height
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
