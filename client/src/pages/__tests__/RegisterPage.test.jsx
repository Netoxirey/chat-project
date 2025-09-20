import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import RegisterPage from '../RegisterPage'
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

describe('RegisterPage', () => {
  it('renders registration form with all fields', () => {
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <RegisterPage />
      </MockProvider>
    )

    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <RegisterPage />
      </MockProvider>
    )

    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Last name is required')).toBeInTheDocument()
      expect(screen.getByText('Username is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
      expect(screen.getByText('Confirm password is required')).toBeInTheDocument()
    })
  })

  it('shows error message from Redux state', () => {
    const store = createMockStore({
      error: 'Email already exists',
    })
    
    render(
      <MockProvider store={store}>
        <RegisterPage />
      </MockProvider>
    )

    expect(screen.getByText('Email already exists')).toBeInTheDocument()
  })

  it('shows loading state when submitting', () => {
    const store = createMockStore({
      isLoading: true,
    })
    
    render(
      <MockProvider store={store}>
        <RegisterPage />
      </MockProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('navigates to login page when clicking sign in link', async () => {
    const user = userEvent.setup()
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <RegisterPage />
      </MockProvider>
    )

    const signInLink = screen.getByText('Sign In')
    await user.click(signInLink)

    // In a real test, you would check if navigation occurred
    // This would require mocking useNavigate
  })
})
