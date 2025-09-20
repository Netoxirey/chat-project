import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import ProtectedRoute from '../ProtectedRoute'

// Mock store
const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: (state = authState) => state,
    },
  })
}

const MockProvider = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
)

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    const store = createMockStore({
      isAuthenticated: false,
      isLoading: false,
    })

    render(
      <MockProvider store={store}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MockProvider>
    )

    // Should redirect to login, so protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading spinner when loading', () => {
    const store = createMockStore({
      isAuthenticated: false,
      isLoading: true,
    })

    render(
      <MockProvider store={store}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MockProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    const store = createMockStore({
      isAuthenticated: true,
      isLoading: false,
    })

    render(
      <MockProvider store={store}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MockProvider>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
