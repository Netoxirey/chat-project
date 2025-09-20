import { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material'
import {
  Search,
  Add,
  Settings,
  LightMode,
  DarkMode,
  MoreVert,
  AccessTime,
  PushPin,
  ExpandLess,
  ExpandMore,
  Chat,
  Logout,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleClose()
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handlePinnedToggle = () => {
    setPinnedOpen(!pinnedOpen)
  }

  // Mock data for recent chats
  const recentChats = [
    { id: 1, title: 'New Chat', time: 'hace 1 segundo', messages: 0, active: true },
    { id: 2, title: 'Research: vector datab...', time: 'hace 10 minutos', messages: 0 },
    { id: 3, title: 'Prompt library - onboar...', time: 'hace 15 minutos', messages: 0 },
    { id: 4, title: 'AI agent: inbox clean-u...', time: 'hace 35 minutos', messages: 0 },
    { id: 5, title: 'Code review: message...', time: 'hace 50 minutos', messages: 0 },
    { id: 6, title: 'LLM evals - rubric + dat...', time: 'hace 450 horas', messages: 0 },
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a', color: 'white' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            ✦ AI Assistant
          </Typography>
        </Box>
        
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search..."
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#2a2a2a',
              color: 'white',
              '& fieldset': {
                borderColor: '#444',
              },
              '&:hover fieldset': {
                borderColor: '#666',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#999',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Start New Chat Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          sx={{
            mt: 2,
            backgroundColor: 'white',
            color: 'black',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
          onClick={() => navigate('/')}
        >
          Start New Chat
        </Button>
      </Box>

      {/* Chat Lists */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Pinned Chats */}
        <Box>
          <ListItem
            button
            onClick={handlePinnedToggle}
            sx={{ color: 'white', px: 2 }}
          >
            <ListItemIcon>
              <PushPin sx={{ color: '#999' }} />
            </ListItemIcon>
            <ListItemText primary="PINNED CHATS" />
            {pinnedOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={pinnedOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Pinned chats would go here */}
            </List>
          </Collapse>
        </Box>

        {/* Recent Chats */}
        <Box>
          <ListItem sx={{ color: 'white', px: 2 }}>
            <ListItemIcon>
              <AccessTime sx={{ color: '#999' }} />
            </ListItemIcon>
            <ListItemText primary="RECENT" />
          </ListItem>
          
          <List>
            {recentChats.map((chat) => (
              <ListItem
                key={chat.id}
                button
                onClick={() => navigate(chat.active ? '/' : `/chat/${chat.id}`)}
                sx={{
                  backgroundColor: chat.active ? '#2a2a2a' : 'transparent',
                  borderLeft: chat.active ? '3px solid #1976d2' : 'none',
                  '&:hover': {
                    backgroundColor: '#2a2a2a',
                  },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: chat.active ? 'bold' : 'normal' }}>
                      {chat.title}
                    </Typography>
                    <IconButton size="small" sx={{ color: '#999' }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {chat.time}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {chat.messages} messages
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
        {/* Settings */}
        <ListItem button sx={{ color: 'white', px: 0, mb: 1 }}>
          <ListItemIcon>
            <Settings sx={{ color: '#999' }} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>

        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
          <LightMode sx={{ color: '#999', mr: 1 }} />
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#1976d2',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#1976d2',
                  },
                }}
              />
            }
            label="Light"
            sx={{ color: 'white', '& .MuiFormControlLabel-label': { color: 'white' } }}
          />
        </Box>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              Pro workspace
            </Typography>
          </Box>
          <IconButton onClick={handleMenu} sx={{ color: 'white' }}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a2a',
            color: 'white',
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#1a1a1a' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              backgroundColor: '#1a1a1a',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              backgroundColor: '#1a1a1a',
              position: 'relative',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 280px)` },
          ml: { md: '280px' },
          minHeight: '100vh',
          backgroundColor: '#1a1a1a',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout