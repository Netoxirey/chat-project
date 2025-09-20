import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store } from './store'
import { SocketProvider } from './contexts/SocketContext.jsx'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatListPage from './pages/ChatListPage'
import ChatPage from './pages/ChatPage'
import TestAuthPage from './pages/TestAuthPage'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/test-auth" element={<TestAuthPage />} />
            
            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<ChatListPage />} />
                        <Route path="/chat/:chatRoomId" element={<ChatPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </SocketProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App