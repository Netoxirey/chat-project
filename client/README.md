# React Blog Client

A modern React frontend for the chat blog application built with Vite, Redux Toolkit, Material UI, and React Router v6.

## Features

- **Authentication & Authorization**: JWT-based authentication with HTTP-only cookies
- **Routing**: React Router v6 with protected routes
- **State Management**: Redux Toolkit with async thunks
- **UI Components**: Material UI (MUI) with responsive design
- **Form Handling**: React Hook Form with Yup validation
- **Blog Features**:
  - List posts with pagination and search
  - View single post with comments
  - Create/edit/delete posts (authenticated users)
  - Add/delete comments (authenticated users)
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky hooks

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Material UI** - UI component library
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **Axios** - HTTP client
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Chat Blog App
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Code Quality

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── ProtectedRoute.jsx  # Route protection wrapper
│   └── __tests__/      # Component tests
├── pages/              # Page components
│   ├── LoginPage.jsx   # User login
│   ├── RegisterPage.jsx # User registration
│   ├── PostListPage.jsx # Blog post list
│   ├── PostDetailPage.jsx # Single post view
│   ├── CreatePostPage.jsx # Create new post
│   ├── EditPostPage.jsx # Edit existing post
│   └── __tests__/      # Page tests
├── store/              # Redux store configuration
│   ├── index.js        # Store setup
│   └── slices/         # Redux slices
│       ├── authSlice.js    # Authentication state
│       ├── postsSlice.js   # Posts state
│       └── commentsSlice.js # Comments state
├── hooks/              # Custom React hooks
│   └── useAuth.js      # Authentication hook
├── schemas/            # Validation schemas
│   └── validationSchemas.js # Yup schemas
├── utils/              # Utility functions
│   └── api.js          # Axios configuration
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── setupTests.js       # Test setup
```

## Authentication Flow

The app uses HTTP-only cookies for authentication:

1. **Login/Register**: Credentials are sent to `/api/cookie-auth/login` or `/api/cookie-auth/register`
2. **Cookie Storage**: Server sets `accessToken` and `refreshToken` as HTTP-only cookies
3. **Automatic Requests**: Axios automatically includes cookies in requests
4. **Token Refresh**: Automatic token refresh when access token expires
5. **Logout**: Cookies are cleared on logout

## API Integration

The app communicates with the backend API through:

- **Base URL**: Configurable via `VITE_API_BASE_URL` environment variable
- **Credentials**: All requests include cookies for authentication
- **Error Handling**: Centralized error handling with automatic redirects
- **Loading States**: Redux manages loading states for all async operations

## State Management

Redux Toolkit is used for state management with the following slices:

- **authSlice**: User authentication state, login/logout actions
- **postsSlice**: Blog posts state, CRUD operations
- **commentsSlice**: Comments state, CRUD operations

## Routing

React Router v6 is used for client-side routing:

- **Public Routes**: `/login`, `/register`
- **Protected Routes**: All other routes require authentication
- **Layout**: Protected routes are wrapped with the main layout component

## Testing

Tests are written using Vitest and React Testing Library:

- **Component Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **Mocking**: Redux store and API calls are mocked in tests

## Code Quality

The project enforces code quality through:

- **ESLint**: JavaScript/React linting rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit linting
- **TypeScript**: Type checking (optional)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Application name | `Chat Blog App` |

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Run linting and formatting before committing
4. Use meaningful commit messages

## License

MIT