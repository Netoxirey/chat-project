# Chat API Backend

A modern, scalable chat API backend built with Node.js, Express.js, and Socket.io. Features real-time messaging, user authentication, and a robust database schema using PostgreSQL and Prisma ORM.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with secure password hashing
- **Real-time Messaging**: Socket.io integration for instant message delivery
- **Database Management**: PostgreSQL with Prisma ORM for type-safe database operations
- **Modular Architecture**: Clean separation of concerns with routes, controllers, services, and middleware
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Centralized error handling with standardized API responses
- **Testing**: Comprehensive test suite using Jest and Supertest
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Security**: Rate limiting, CORS, helmet, and secure password policies

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/chat_db?schema=public"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   JWT_REFRESH_EXPIRES_IN="30d"
   
   # Server
   PORT=3000
   NODE_ENV="development"
   
   # CORS
   CORS_ORIGIN="http://localhost:3000"
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── messageController.js
│   ├── chatRoomController.js
│   └── userController.js
├── database/
│   └── connection.js     # Database connection setup
├── middleware/           # Custom middleware
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   └── errorMiddleware.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── messageRoutes.js
│   ├── chatRoomRoutes.js
│   └── userRoutes.js
├── services/            # Business logic
│   ├── authService.js
│   ├── messageService.js
│   └── chatRoomService.js
├── socket/              # Socket.io handlers
│   └── socketHandler.js
├── tests/               # Test files
│   ├── setup.js
│   ├── auth.test.js
│   ├── message.test.js
│   └── chatRoom.test.js
├── utils/               # Utility functions
│   ├── jwt.js
│   ├── password.js
│   └── errorHandler.js
└── server.js            # Application entry point
```

## 🔧 API Endpoints

### Authentication

#### Header-based Authentication (JWT in Authorization header)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Cookie-based Authentication (JWT in HTTP-only cookies)
- `POST /api/cookie-auth/register` - Register a new user
- `POST /api/cookie-auth/login` - Login user (sets cookies)
- `POST /api/cookie-auth/logout` - Logout user (clears cookies)
- `POST /api/cookie-auth/refresh-token` - Refresh access token
- `GET /api/cookie-auth/profile` - Get user profile
- `PUT /api/cookie-auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/online` - Get online users
- `GET /api/users/:userId` - Get user by ID

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/chat-room/:chatRoomId` - Get chat room messages
- `GET /api/messages/direct/:userId` - Get direct messages
- `PUT /api/messages/mark-read` - Mark messages as read
- `PUT /api/messages/:messageId` - Edit a message
- `DELETE /api/messages/:messageId` - Delete a message

### Chat Rooms
- `POST /api/chat-rooms` - Create a chat room
- `GET /api/chat-rooms` - Get user's chat rooms
- `GET /api/chat-rooms/search` - Search chat rooms
- `GET /api/chat-rooms/:chatRoomId` - Get chat room by ID
- `PUT /api/chat-rooms/:chatRoomId` - Update chat room
- `DELETE /api/chat-rooms/:chatRoomId` - Delete chat room
- `POST /api/chat-rooms/:chatRoomId/users` - Add user to chat room
- `DELETE /api/chat-rooms/:chatRoomId/users/:userId` - Remove user from chat room

## 🔌 Socket.io Events

### Client to Server
- `join_chat_room` - Join a chat room
- `leave_chat_room` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_messages_read` - Mark messages as read

### Server to Client
- `new_message` - New message received
- `message_sent` - Message sent confirmation
- `user_joined` - User joined chat room
- `user_left` - User left chat room
- `user_typing` - User typing indicator
- `messages_read` - Messages marked as read

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Database Schema

### Users
- `id` - Unique identifier
- `email` - User email (unique)
- `username` - Username (unique)
- `password` - Hashed password
- `firstName` - First name
- `lastName` - Last name
- `avatar` - Profile picture URL
- `isOnline` - Online status
- `lastSeen` - Last seen timestamp

### Chat Rooms
- `id` - Unique identifier
- `name` - Chat room name
- `description` - Chat room description
- `type` - Room type (DIRECT, GROUP, CHANNEL)
- `isActive` - Active status
- `creatorId` - Creator user ID

### Messages
- `id` - Unique identifier
- `content` - Message content
- `type` - Message type (TEXT, IMAGE, FILE, SYSTEM)
- `isRead` - Read status
- `isEdited` - Edited status
- `senderId` - Sender user ID
- `receiverId` - Receiver user ID (for direct messages)
- `chatRoomId` - Chat room ID (for group messages)

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Cookie Authentication**: HTTP-only cookies for enhanced security
- **Rate Limiting**: Prevent abuse with request rate limiting
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🍪 Cookie Authentication

The API supports both header-based and cookie-based authentication:

### Cookie-based Authentication (Recommended for Web Apps)

**Advantages:**
- More secure (HTTP-only cookies can't be accessed by JavaScript)
- Automatic cookie handling by browsers
- Protection against XSS attacks
- Automatic cookie expiration

**Usage:**
1. **Login**: `POST /api/cookie-auth/login` - Sets `accessToken` and `refreshToken` cookies
2. **Access Protected Routes**: Cookies are automatically sent with requests
3. **Logout**: `POST /api/cookie-auth/logout` - Clears all authentication cookies
4. **Refresh Token**: `POST /api/cookie-auth/refresh-token` - Refreshes access token

**Cookie Configuration:**
- `httpOnly: true` - Prevents JavaScript access
- `secure: true` - HTTPS only in production
- `sameSite: 'strict'` - CSRF protection
- `maxAge: 7 days` - Access token expiration
- `maxAge: 30 days` - Refresh token expiration

### Header-based Authentication (For Mobile/API clients)

**Usage:**
1. **Login**: `POST /api/auth/login` - Returns tokens in response body
2. **Access Protected Routes**: Include `Authorization: Bearer <token>` header
3. **Logout**: `POST /api/auth/logout` - Requires Authorization header
4. **Refresh Token**: `POST /api/auth/refresh-token` - Send refresh token in body

## 🚀 Deployment

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   JWT_SECRET="your-production-jwt-secret"
   CORS_ORIGIN="your-frontend-domain"
   ```

2. **Build and Start**
   ```bash
   npm start
   ```

3. **Database Migration**
   ```bash
   npm run db:migrate
   ```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
