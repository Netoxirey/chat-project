import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { loginUser, getCurrentUser } from '../store/slices/authSlice'

const TestAuthPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await dispatch(loginUser(loginData)).unwrap()
      console.log('Login successful!')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }


  const handleCheckAuth = async () => {
    try {
      await dispatch(getCurrentUser()).unwrap()
      console.log('Auth check successful!')
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Test Authentication
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isAuthenticated && user && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Logged in as: {user.firstName} {user.lastName} ({user.email})
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleCheckAuth}
          disabled={isLoading}
        >
          Check Auth
        </Button>
        {isLoading && <CircularProgress size={24} />}
      </Box>

      {/* Login Form */}
      <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default TestAuthPage
