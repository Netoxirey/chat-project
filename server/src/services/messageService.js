const prisma = require('../database/connection');
const { AppError } = require('../utils/errorHandler');

/**
 * Send a message
 * @param {Object} messageData - Message data
 * @param {string} senderId - Sender user ID
 * @returns {Promise<Object>} Created message
 */
const sendMessage = async (messageData, senderId) => {
  const { content, type = 'TEXT', receiverId, chatRoomId } = messageData;

  // Validate that either receiverId or chatRoomId is provided
  if (!receiverId && !chatRoomId) {
    throw new AppError('Either receiverId or chatRoomId must be provided', 400);
  }

  if (receiverId && chatRoomId) {
    throw new AppError('Cannot provide both receiverId and chatRoomId', 400);
  }

  // If sending to a chat room, verify user is a member
  if (chatRoomId) {
    const membership = await prisma.chatRoomUser.findFirst({
      where: {
        userId: senderId,
        chatRoomId,
        isActive: true,
      },
    });

    if (!membership) {
      throw new AppError('You are not a member of this chat room', 403);
    }
  }

  // If sending to a user, verify the receiver exists
  if (receiverId) {
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      content,
      type,
      senderId,
      receiverId,
      chatRoomId,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      chatRoom: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  return message;
};

/**
 * Get messages for a chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Messages and pagination info
 */
const getChatRoomMessages = async (chatRoomId, userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  // Verify user is a member of the chat room
  const membership = await prisma.chatRoomUser.findFirst({
    where: {
      userId,
      chatRoomId,
      isActive: true,
    },
  });

  if (!membership) {
    throw new AppError('You are not a member of this chat room', 403);
  }

  const skip = (page - 1) * limit;

  // Get messages
  const messages = await prisma.message.findMany({
    where: { chatRoomId },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  // Get total count
  const totalMessages = await prisma.message.count({
    where: { chatRoomId },
  });

  return {
    messages,
    pagination: {
      page,
      limit,
      total: totalMessages,
      pages: Math.ceil(totalMessages / limit),
    },
  };
};

/**
 * Get direct messages between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Messages and pagination info
 */
const getDirectMessages = async (userId1, userId2, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  // Get messages between the two users
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  // Get total count
  const totalMessages = await prisma.message.count({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
  });

  return {
    messages,
    pagination: {
      page,
      limit,
      total: totalMessages,
      pages: Math.ceil(totalMessages / limit),
    },
  };
};

/**
 * Mark messages as read
 * @param {string} userId - User ID
 * @param {string} chatRoomId - Chat room ID (optional)
 * @param {string} senderId - Sender ID (optional)
 * @returns {Promise<number>} Number of messages marked as read
 */
const markMessagesAsRead = async (
  userId,
  chatRoomId = null,
  senderId = null
) => {
  const whereClause = {
    isRead: false,
    OR: [],
  };

  if (chatRoomId) {
    whereClause.OR.push({ chatRoomId });
  }

  if (senderId) {
    whereClause.OR.push({ senderId, receiverId: userId });
  }

  // If no specific criteria, mark all unread messages for the user
  if (!chatRoomId && !senderId) {
    whereClause.OR.push({ receiverId: userId });
  }

  const result = await prisma.message.updateMany({
    where: whereClause,
    data: { isRead: true },
  });

  return result.count;
};

/**
 * Edit a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @param {string} content - New content
 * @returns {Promise<Object>} Updated message
 */
const editMessage = async (messageId, userId, content) => {
  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Check if user is the sender
  if (message.senderId !== userId) {
    throw new AppError('You can only edit your own messages', 403);
  }

  // Update message
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      isEdited: true,
      editedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      chatRoom: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  return updatedMessage;
};

/**
 * Delete a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteMessage = async (messageId, userId) => {
  // Find the message
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Check if user is the sender
  if (message.senderId !== userId) {
    throw new AppError('You can only delete your own messages', 403);
  }

  // Delete message
  await prisma.message.delete({
    where: { id: messageId },
  });
};

module.exports = {
  sendMessage,
  getChatRoomMessages,
  getDirectMessages,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
};
