import { Box, Typography, Button } from '@mui/material'
import { Chat, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ChatListPage = () => {
  const navigate = useNavigate()
  const { chatRooms } = useSelector((state) => state.chatRooms)

  const handleStartChat = () => {
    if (chatRooms.length > 0) {
      navigate(`/chat/${chatRooms[0].id}`)
    }
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#1a1a1a',
      textAlign: 'center',
      p: 3
    }}>
      <Chat sx={{ fontSize: 80, color: '#1976d2', mb: 3 }} />
      
      <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
        Welcome to Chat App
      </Typography>
      
      <Typography variant="body1" sx={{ color: '#999', mb: 4, maxWidth: 500 }}>
        Select a chat from the sidebar to start messaging, or create a new conversation.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<Add />}
        onClick={handleStartChat}
        sx={{
          backgroundColor: '#1976d2',
          px: 4,
          py: 1.5,
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        Start Chatting
      </Button>
    </Box>
  )
}

export default ChatListPage