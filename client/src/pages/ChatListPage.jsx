import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Fab,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Search,
  Add,
  MoreVert,
  Chat,
  Group,
  Person,
} from '@mui/icons-material'
import { fetchChatRooms } from '../store/slices/chatRoomsSlice'
import { useAuth } from '../hooks/useAuth'

const ChatListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [_selectedChatRoom, _setSelectedChatRoom] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { chatRooms, isLoading, error } = useSelector((state) => state.chatRooms)

  useEffect(() => {
    dispatch(fetchChatRooms())
  }, [dispatch])

  const handleChatRoomClick = (chatRoomId) => {
    navigate(`/chat/${chatRoomId}`)
  }

  const handleMenuClick = (event, chatRoom) => {
    setAnchorEl(event.currentTarget)
    _setSelectedChatRoom(chatRoom)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    _setSelectedChatRoom(null)
  }

  const handleCreateChatRoom = () => {
    // TODO: Implement create chat room dialog
    console.log('Create chat room')
  }

  const getChatRoomIcon = (type) => {
    switch (type) {
      case 'DIRECT':
        return <Person />
      case 'GROUP':
        return <Group />
      case 'CHANNEL':
        return <Chat />
      default:
        return <Chat />
    }
  }

  const getLastMessagePreview = (chatRoom) => {
    if (!chatRoom.lastMessage) return 'No messages yet'
    
    const message = chatRoom.lastMessage
    const sender = message.senderId === user?.id ? 'You' : message.sender?.firstName
    return `${sender}: ${message.content}`
  }

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const filteredChatRooms = chatRooms.filter(chatRoom =>
    chatRoom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chatRoom.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Chats
        </Typography>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateChatRoom}
          size="medium"
        >
          <Add />
        </Fab>
      </Box>

      <TextField
        fullWidth
        placeholder="Search chats..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {filteredChatRooms.map((chatRoom) => (
            <ListItem
              key={chatRoom.id}
              button
              onClick={() => handleChatRoomClick(chatRoom.id)}
              sx={{
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  {getChatRoomIcon(chatRoom.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" noWrap>
                      {chatRoom.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        {formatLastMessageTime(chatRoom.lastMessage?.createdAt)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuClick(e, chatRoom)
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box component="span">
                    <Typography variant="body2" color="text.secondary" noWrap component="span">
                      {getLastMessagePreview(chatRoom)}
                    </Typography>
                    {chatRoom.type !== 'DIRECT' && (
                      <Chip
                        label={chatRoom.type}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5, ml: 1 }}
                        component="span"
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Mute Notifications</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Leave Chat
        </MenuItem>
      </Menu>
    </Container>
  )
}

export default ChatListPage
