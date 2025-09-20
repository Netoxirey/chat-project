import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef } from 'react'
import { getCurrentUser, clearAuth, logoutUser } from '../store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error, hasCheckedAuth } = useSelector((state) => state.auth)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Check if user is authenticated on app load only once
    if (!hasInitialized.current && !hasCheckedAuth) {
      hasInitialized.current = true
      console.log('Initializing auth check...')
      dispatch(getCurrentUser())
    }
  }, [dispatch, hasCheckedAuth])

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(clearAuth())
      hasInitialized.current = false
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
  }
}
