import axios from 'axios'

// Use same-origin by default to avoid CSP and CORS issues in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Ensure credentials are always sent
api.defaults.withCredentials = true

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url)
    console.log('With credentials:', config.withCredentials)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url)
    console.log('Response headers:', response.headers)
    return response
  },
  (error) => {
    console.error('API error:', error.response?.status, error.config?.url, error.message)
    // Don't redirect to login automatically - let the components handle it
    return Promise.reject(error)
  }
)

export default api
