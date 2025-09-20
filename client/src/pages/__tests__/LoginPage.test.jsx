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
  it('renders demo login page with user buttons', () => {
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    expect(screen.getByText('Demo Login')).toBeInTheDocument()
    expect(screen.getByText('Choose a demo user to login with')).toBeInTheDocument()
    expect(screen.getByText('Login as John')).toBeInTheDocument()
    expect(screen.getByText('Login as Jane')).toBeInTheDocument()
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

    // Should show loading indicators in the buttons
    const loadingIndicators = screen.getAllByRole('progressbar')
    expect(loadingIndicators).toHaveLength(2) // One for each user button
  })

  it('renders John and Jane user buttons with correct information', () => {
    const store = createMockStore()
    
    render(
      <MockProvider store={store}>
        <LoginPage />
      </MockProvider>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })
})
