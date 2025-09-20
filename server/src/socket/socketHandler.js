const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const prisma = require('../database/connection');
const messageService = require('../services/messageService');

let io;

/**
 * Initialize Socket.io server
 * @param {Object} server - HTTP server instance
 */
const initializeSocket = server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
          ],
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    console.log('Socket connection attempt:', {
      id: socket.id,
      namespace: socket.nsp.name,
      url: socket.handshake.url,
      headers: socket.handshake.headers,
      auth: socket.handshake.auth,
    });

    try {
      let token = null;

      // Try to get token from auth object first
      token = socket.handshake.auth.token;

      // If no token in auth, try Authorization header
      if (!token) {
        token = socket.handshake.headers.authorization?.replace('Bearer ', '');
      }

      // If no token in header, try cookies
      if (!token) {
        const cookies = socket.handshake.headers.cookie;
        if (cookies) {
          const cookieMatch = cookies.match(/accessToken=([^;]+)/);
          if (cookieMatch) {
            token = cookieMatch[1];
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', socket => {
    console.log(
      `User ${socket.user.username} connected with socket ID: ${socket.id}`
    );
    console.log('Socket namespace:', socket.nsp.name);
    console.log('Socket transport:', socket.conn.transport.name);
    console.log('Socket server URL:', socket.handshake.url);
    console.log('Socket headers:', socket.handshake.headers);

    // Update user online status
    updateUserOnlineStatus(socket.user.id, true);

    // Join user to their personal room
    socket.join(`user_${socket.user.id}`);

    // Handle joining chat rooms
    socket.on('join_chat_room', async data => {
      try {
        const { chatRoomId } = data;
        console.log(
          `User ${socket.user.username} joining chat room ${chatRoomId}`
        );

        // Temporarily skip membership validation for testing
        // TODO: Re-enable membership validation in production
        /*
        const membership = await prisma.chatRoomUser.findFirst({
          where: {
            userId: socket.user.id,
            chatRoomId,
            isActive: true,
          },
        });

        if (!membership) {
          socket.emit('error', {
            message: 'You are not a member of this chat room',
          });
          return;
        }
        */

        socket.join(`chat_room_${chatRoomId}`);
        socket.emit('joined_chat_room', { chatRoomId });
        console.log(
          `User ${socket.user.username} successfully joined chat room ${chatRoomId}`
        );

        // Notify other users in the chat room
        socket.to(`chat_room_${chatRoomId}`).emit('user_joined', {
          user: socket.user,
          chatRoomId,
        });
      } catch (error) {
        console.error('Error joining chat room:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave_chat_room', data => {
      const { chatRoomId } = data;
      socket.leave(`chat_room_${chatRoomId}`);
      socket.emit('left_chat_room', { chatRoomId });

      // Notify other users in the chat room
      socket.to(`chat_room_${chatRoomId}`).emit('user_left', {
        user: socket.user,
        chatRoomId,
      });
    });

    // Handle sending messages
    socket.on('send_message', async data => {
      try {
        const { content, type = 'TEXT', receiverId, chatRoomId } = data;

        // Validate message data
        if (!content || (!receiverId && !chatRoomId)) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Send message using service
        const message = await messageService.sendMessage(
          { content, type, receiverId, chatRoomId },
          socket.user.id
        );

        // Emit message to appropriate recipients
        if (chatRoomId) {
          // Broadcast to all users in the chat room
          console.log(
            `Broadcasting message to chat room ${chatRoomId}:`,
            message
          );
          io.to(`chat_room_${chatRoomId}`).emit('new_message', {
            message,
            chatRoomId,
          });
        } else if (receiverId) {
          // Send to specific user
          io.to(`user_${receiverId}`).emit('new_message', {
            message,
            receiverId,
          });

          // Also send back to sender for confirmation
          socket.emit('message_sent', { message });
        }
      } catch (error) {
        socket.emit('error', {
          message: error.message || 'Failed to send message',
        });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', data => {
      const { chatRoomId, receiverId } = data;

      if (chatRoomId) {
        socket.to(`chat_room_${chatRoomId}`).emit('user_typing', {
          user: socket.user,
          chatRoomId,
          isTyping: true,
        });
      } else if (receiverId) {
        socket.to(`user_${receiverId}`).emit('user_typing', {
          user: socket.user,
          receiverId,
          isTyping: true,
        });
      }
    });

    socket.on('typing_stop', data => {
      const { chatRoomId, receiverId } = data;

      if (chatRoomId) {
        socket.to(`chat_room_${chatRoomId}`).emit('user_typing', {
          user: socket.user,
          chatRoomId,
          isTyping: false,
        });
      } else if (receiverId) {
        socket.to(`user_${receiverId}`).emit('user_typing', {
          user: socket.user,
          receiverId,
          isTyping: false,
        });
      }
    });

    // Handle message read status
    socket.on('mark_messages_read', async data => {
      try {
        const { chatRoomId, senderId } = data;

        const count = await messageService.markMessagesAsRead(
          socket.user.id,
          chatRoomId,
          senderId
        );

        // Notify sender that messages were read
        if (senderId) {
          io.to(`user_${senderId}`).emit('messages_read', {
            reader: socket.user,
            count,
            chatRoomId,
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      updateUserOnlineStatus(socket.user.id, false);
    });
  });

  return io;
};

/**
 * Update user online status
 * @param {string} userId - User ID
 * @param {boolean} isOnline - Online status
 */
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to update user online status:', error);
  }
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

/**
 * Emit event to chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToChatRoom = (chatRoomId, event, data) => {
  if (io) {
    io.to(`chat_room_${chatRoomId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToChatRoom,
};
