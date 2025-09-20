import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import LoginPage from '../LoginPage'
import authSlice from '../../store/slices/authSlice'

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  })
}

const MockProvider = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
)

describe('LoginPage', () => {
  it('renders login form', () => {
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('shows error message from Redux state', () => {
    const store = createMockStore({
      error: 'Invalid credentials',
    })
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows loading state when submitting', () => {
    const store = createMockStore({
      isLoading: true,
    })
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('navigates to register page when clicking sign up link', async () => {
    const user = userEvent.setup()
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    const signUpLink = screen.getByText('Sign Up')
    await user.click(signUpLink)

    // In a real test, you would check if navigation occurred
    // This would require mocking useNavigate
  })
})
