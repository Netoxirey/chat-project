import { useState, useEffect } from 'react'
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
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Search,
  Add,
  Settings,
  MoreVert,
  Chat,
  Logout,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { fetchChatRooms } from '../store/slices/chatRoomsSlice'

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const { chatRooms, isLoading, error } = useSelector((state) => state.chatRooms)

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

  // Load chat rooms on component mount
  useEffect(() => {
    dispatch(fetchChatRooms())
  }, [dispatch])

  const handleChatRoomClick = (chatRoomId) => {
    navigate(`/chat/${chatRoomId}`)
  }

  const handleCreateChat = () => {
    // For now, just navigate to the first available chat room
    if (chatRooms.length > 0) {
      navigate(`/chat/${chatRooms[0].id}`)
    }
  }

  // Filter chat rooms based on search query
  const filteredChatRooms = chatRooms.filter(chatRoom =>
    chatRoom.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a', color: 'white' , width: '100%'}}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            Chat App
          </Typography>
        </Box>
        
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search chats..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        
        {/* Create New Chat Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          sx={{
            mt: 2,
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
          onClick={handleCreateChat}
        >
          New Chat
        </Button>
      </Box>

      {/* Chat Lists */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ backgroundColor: '#2a2a2a', color: 'white' }}>
              {error}
            </Alert>
          </Box>
        ) : (
          <List>
            {filteredChatRooms.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No chats found"
                  sx={{ color: '#999', textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              filteredChatRooms.map((chatRoom) => {
                const isActive = location.pathname === `/chat/${chatRoom.id}`
                return (
                  <ListItem
                    key={chatRoom.id}
                    button
                    onClick={() => handleChatRoomClick(chatRoom.id)}
                    sx={{
                      backgroundColor: isActive ? '#2a2a2a' : 'transparent',
                      borderLeft: isActive ? '3px solid #1976d2' : 'none',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                        <Chat />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: isActive ? 'bold' : 'normal' }}>
                          {chatRoom.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {chatRoom.type === 'DIRECT' ? 'Direct Chat' : 'Group Chat'}
                        </Typography>
                      }
                    />
                    <IconButton size="small" sx={{ color: '#999' }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </ListItem>
                )
              })
            )}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
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
              {user?.email}
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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw',
      bgcolor: '#1a1a1a',
      overflow: 'hidden'
    }}>
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
          width: { md: `calc(100vw - 280px)` },
          ml: { md: '280px' },
          minHeight: '100vh',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout