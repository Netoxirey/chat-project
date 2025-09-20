import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useSocketContext } from '../hooks/useSocketContext'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  Send,
  AttachFile,
  Mic,
  MoreVert,
  Chat,
} from '@mui/icons-material'
import { fetchMessages, sendMessage } from '../store/slices/messagesSlice'
import { useAuth } from '../hooks/useAuth'

const ChatPage = () => {
  const { chatRoomId } = useParams()
  const _navigate = useNavigate()
  const dispatch = useDispatch()
  const { socket } = useSocketContext()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [socketReady, setSocketReady] = useState(false)
  
  const { messages, isLoading, error } = useSelector((state) => state.messages)

  const orderedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }, [messages])

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when component mounts or chatRoomId changes
  useEffect(() => {
    if (chatRoomId) {
      dispatch(fetchMessages(chatRoomId))
    }
  }, [dispatch, chatRoomId])

  // Socket event listeners
  useEffect(() => {
    if (socket && chatRoomId) {
      // Join chat room
      socket.emit('join_chat_room', { chatRoomId })
      
      // Set a timeout to mark socket as ready even if we don't get confirmation
      const readyTimeout = setTimeout(() => {
        console.log('Socket ready timeout - marking as ready')
        setSocketReady(true)
      }, 2000)

      const onReconnect = () => {
        socket.emit('join_chat_room', { chatRoomId })
        setSocketReady(true)
      }

      const onJoined = (data) => {
        console.log('Joined chat room:', data)
        setSocketReady(true)
      }

      const onSocketError = (err) => {
        console.error('Socket error event:', err)
      }

      // Listen for new messages
      socket.on('new_message', (payload) => {
        console.log('Received new_message:', payload)
        const incoming = payload?.message ?? payload
        const incomingRoomId = payload?.chatRoomId ?? incoming?.chatRoomId
        console.log('Incoming message:', incoming, 'Room ID:', incomingRoomId, 'Current room:', chatRoomId)
        if (incoming && String(incomingRoomId) === String(chatRoomId)) {
          console.log('Adding message to store:', incoming)
          dispatch({ type: 'messages/addMessage', payload: incoming })
        } else {
          console.log('Message not for this room or invalid message')
        }
      })

      socket.on('joined_chat_room', onJoined)
      socket.on('connect', onReconnect)
      socket.on('error', onSocketError)

      // Listen for typing events
      socket.on('user_typing', (data) => {
        if (data.chatRoomId === chatRoomId && data.userId !== user?.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== data.userId)
            return [...filtered, { userId: data.userId, username: data.username }]
          })
          
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
          }, 3000)
        }
      })

      // Listen for stop typing events
      socket.on('user_stop_typing', (data) => {
        if (data.chatRoomId === chatRoomId) {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
        }
      })

      return () => {
        clearTimeout(readyTimeout)
        socket.emit('leave_chat_room', { chatRoomId })
        socket.off('new_message')
        socket.off('joined_chat_room', onJoined)
        socket.off('connect', onReconnect)
        socket.off('error', onSocketError)
        socket.off('user_typing')
        socket.off('user_stop_typing')
      }
    }
  }, [socket, chatRoomId, user?.id, dispatch])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoomId) return

    const messageData = {
      content: newMessage.trim(),
      chatRoomId: chatRoomId,
      type: 'TEXT'
    }

    try {
      // Wait a bit for socket to be ready
      if (socket?.connected && socketReady) {
        console.log('Sending message via socket:', messageData)
        console.log('Socket connected status:', socket.connected)
        console.log('Socket ready status:', socketReady)
        socket.emit('send_message', messageData)
      } else {
        console.log('Socket not ready, sending via API')
        console.log('Socket status:', socket ? 'exists but not connected' : 'null')
        console.log('Socket ready:', socketReady)
        await dispatch(sendMessage(messageData)).unwrap()
      }
      
      // Clear input
      setNewMessage('')
      
      // Stop typing indicator
      if (isTyping) {
        socket?.emit('stop_typing', { chatRoomId })
        setIsTyping(false)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      socket?.emit('typing_start', { chatRoomId })
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false)
      socket?.emit('typing_stop', { chatRoomId })
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#1a1a1a',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #333', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: '#1a1a1a',
          flexShrink: 0
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton sx={{ mr: 1, color: 'white' }}>
            <Chat />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Chat Room
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              {messages.length} messages
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label="Certified" size="small" sx={{ bgcolor: '#2a2a2a', color: 'white' }} />
          <Chip label="Personalized" size="small" sx={{ bgcolor: '#2a2a2a', color: 'white' }} />
          <Chip label="Experienced" size="small" sx={{ bgcolor: '#2a2a2a', color: 'white' }} />
          <Chip label="Helpful" size="small" sx={{ bgcolor: '#2a2a2a', color: 'white' }} />
          <IconButton sx={{ color: 'white' }}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: '100%',
        minHeight: 0
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed #444',
            borderRadius: 2,
            color: '#999'
          }}>
            <Typography variant="h6">
              No messages yet. Say hello to start.
            </Typography>
          </Box>
        ) : (
          orderedMessages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.senderId === user?.id ? '#1976d2' : '#2a2a2a',
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mt: 1 }}>
                  {formatTime(message.createdAt)}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#999' }}>
            <Typography variant="body2">
              {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Typography>
            <CircularProgress size={16} />
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #333',
        bgcolor: '#1a1a1a',
        width: '100%',
        maxWidth: '100%',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton sx={{ color: '#999' }}>
            <AttachFile />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="How can I help you today?"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
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
          />
          
          <IconButton sx={{ color: '#999' }}>
            <Mic />
          </IconButton>
          
          <IconButton 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ 
              color: newMessage.trim() ? '#1976d2' : '#999',
              '&:disabled': {
                color: '#999'
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>
        
        <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
          Press <strong>Enter</strong> to send · <strong>Shift</strong> + <strong>Enter</strong> for newline
        </Typography>
      </Box>
    </Box>
  )
}

export default ChatPage