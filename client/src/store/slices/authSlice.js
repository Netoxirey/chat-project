import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with credentials:', credentials)
      const response = await api.post('/cookie-auth/login', credentials)
      console.log('Login response:', response.data)
      console.log('Response headers:', response.headers)
      return response.data
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/cookie-auth/register', userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/cookie-auth/logout')
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking current user...')
      const response = await api.get('/cookie-auth/profile')
      console.log('User profile response:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to get current user:', error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || 'Failed to get user')
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCheckedAuth: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      state.hasCheckedAuth = false
    },
    setHasCheckedAuth: (state) => {
      state.hasCheckedAuth = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.data.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.data.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
        state.hasCheckedAuth = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.data.user
        state.isAuthenticated = true
        state.error = null
        state.hasCheckedAuth = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.hasCheckedAuth = true
      })
  },
})

export const { clearError, clearAuth, setHasCheckedAuth } = authSlice.actions
export default authSlice.reducer
