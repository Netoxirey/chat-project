import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
} from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'
import { loginUser, clearError } from '../store/slices/authSlice'

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { error } = useSelector((state) => state.auth)

  const from = location.state?.from?.pathname || '/'

  const handleUserLogin = async (email) => {
    setIsLoading(true)
    dispatch(clearError())
    
    try {
      // Use the same password for both users as specified in the seed file
      const credentials = {
        email: email,
        password: 'password123'
      }
      await dispatch(loginUser(credentials)).unwrap()
      navigate(from, { replace: true })
    } catch {
      // Error is handled by Redux
    } finally {
      setIsLoading(false)
    }
  }

  const demoUsers = [
    {
      name: 'John',
      fullName: 'John Doe',
      email: 'john@example.com',
      avatar: 'J',
      color: '#1976d2'
    },
    {
      name: 'Jane',
      fullName: 'Jane Smith', 
      email: 'jane@example.com',
      avatar: 'J',
      color: '#dc004e'
    }
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <Container component="main" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
        <Paper elevation={3} sx={{ padding: 6, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
            Demo Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
            Choose a demo user to login with, and in other browser or incognito mode to login with another user.
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {demoUsers.map((user) => (
              <Grid item xs={12} sm={6} md={5} key={user.email}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => handleUserLogin(user.email)}
                  disabled={isLoading}
                  sx={{
                    height: 200,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: user.color,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    '&:hover': {
                      backgroundColor: `${user.color}15`,
                      borderColor: user.color,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={40} sx={{ color: user.color }} />
                  ) : (
                    <>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: user.color,
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {user.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: user.color }}>
                          Login as {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.fullName}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage
