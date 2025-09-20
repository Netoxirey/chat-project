import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CircularProgress, Box, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { hasCheckedAuth } = useSelector((state) => state.auth)
  const location = useLocation()

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'hasCheckedAuth:', hasCheckedAuth)

  // Show loading while checking authentication
  if (isLoading || !hasCheckedAuth) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verificando autenticación...
        </Typography>
      </Box>
    )
  }

  // Only redirect to login if we've checked auth and user is not authenticated
  if (hasCheckedAuth && !isAuthenticated) {
    console.log('User not authenticated, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('User authenticated, rendering protected content')
  return children
}

export default ProtectedRoute
