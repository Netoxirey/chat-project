const prisma = require('../database/connection');
const { AppError } = require('../utils/errorHandler');

/**
 * Create a new chat room
 * @param {Object} chatRoomData - Chat room data
 * @param {string} creatorId - Creator user ID
 * @returns {Promise<Object>} Created chat room
 */
const createChatRoom = async (chatRoomData, creatorId) => {
  const { name, description, type = 'GROUP', userIds = [] } = chatRoomData;

  // Create chat room
  const chatRoom = await prisma.chatRoom.create({
    data: {
      name,
      description,
      type,
      creatorId,
    },
  });

  // Add creator to chat room
  await prisma.chatRoomUser.create({
    data: {
      userId: creatorId,
      chatRoomId: chatRoom.id,
    },
  });

  // Add other users to chat room
  if (userIds.length > 0) {
    const chatRoomUsers = userIds.map(userId => ({
      userId,
      chatRoomId: chatRoom.id,
    }));

    await prisma.chatRoomUser.createMany({
      data: chatRoomUsers,
    });
  }

  // Return chat room with users
  return await getChatRoomById(chatRoom.id, creatorId);
};

/**
 * Get chat room by ID
 * @param {string} chatRoomId - Chat room ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Chat room details
 */
const getChatRoomById = async (chatRoomId, userId) => {
  // Verify user is a member
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

  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      users: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!chatRoom) {
    throw new AppError('Chat room not found', 404);
  }

  return chatRoom;
};

/**
 * Get user's chat rooms
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Chat rooms and pagination info
 */
const getUserChatRooms = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      users: {
        some: {
          userId,
          isActive: true,
        },
      },
      isActive: true,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      users: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
  });

  const totalChatRooms = await prisma.chatRoom.count({
    where: {
      users: {
        some: {
          userId,
          isActive: true,
        },
      },
      isActive: true,
    },
  });

  return {
    chatRooms,
    pagination: {
      page,
      limit,
      total: totalChatRooms,
      pages: Math.ceil(totalChatRooms / limit),
    },
  };
};

/**
 * Add user to chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} userId - User ID to add
 * @param {string} requesterId - User requesting the addition
 * @returns {Promise<Object>} Updated chat room
 */
const addUserToChatRoom = async (chatRoomId, userId, requesterId) => {
  // Verify requester is a member
  const requesterMembership = await prisma.chatRoomUser.findFirst({
    where: {
      userId: requesterId,
      chatRoomId,
      isActive: true,
    },
  });

  if (!requesterMembership) {
    throw new AppError('You are not a member of this chat room', 403);
  }

  // Check if user is already a member
  const existingMembership = await prisma.chatRoomUser.findFirst({
    where: {
      userId,
      chatRoomId,
    },
  });

  if (existingMembership) {
    if (existingMembership.isActive) {
      throw new AppError('User is already a member of this chat room', 400);
    } else {
      // Reactivate membership
      await prisma.chatRoomUser.update({
        where: { id: existingMembership.id },
        data: { isActive: true },
      });
    }
  } else {
    // Create new membership
    await prisma.chatRoomUser.create({
      data: {
        userId,
        chatRoomId,
      },
    });
  }

  return await getChatRoomById(chatRoomId, requesterId);
};

/**
 * Remove user from chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} userId - User ID to remove
 * @param {string} requesterId - User requesting the removal
 * @returns {Promise<Object>} Updated chat room
 */
const removeUserFromChatRoom = async (chatRoomId, userId, requesterId) => {
  // Verify requester is a member
  const requesterMembership = await prisma.chatRoomUser.findFirst({
    where: {
      userId: requesterId,
      chatRoomId,
      isActive: true,
    },
  });

  if (!requesterMembership) {
    throw new AppError('You are not a member of this chat room', 403);
  }

  // Check if user is a member
  const membership = await prisma.chatRoomUser.findFirst({
    where: {
      userId,
      chatRoomId,
      isActive: true,
    },
  });

  if (!membership) {
    throw new AppError('User is not a member of this chat room', 404);
  }

  // Deactivate membership
  await prisma.chatRoomUser.update({
    where: { id: membership.id },
    data: { isActive: false },
  });

  return await getChatRoomById(chatRoomId, requesterId);
};

/**
 * Update chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {Object} updateData - Update data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated chat room
 */
const updateChatRoom = async (chatRoomId, updateData, userId) => {
  // Verify user is the creator
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom) {
    throw new AppError('Chat room not found', 404);
  }

  if (chatRoom.creatorId !== userId) {
    throw new AppError('Only the creator can update this chat room', 403);
  }

  // Update chat room
  await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: updateData,
  });

  return await getChatRoomById(chatRoomId, userId);
};

/**
 * Delete chat room
 * @param {string} chatRoomId - Chat room ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteChatRoom = async (chatRoomId, userId) => {
  // Verify user is the creator
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom) {
    throw new AppError('Chat room not found', 404);
  }

  if (chatRoom.creatorId !== userId) {
    throw new AppError('Only the creator can delete this chat room', 403);
  }

  // Soft delete chat room
  await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: { isActive: false },
  });
};

/**
 * Search chat rooms
 * @param {string} query - Search query
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Search results
 */
const searchChatRooms = async (query, userId, options = {}) => {
  const { page = 1, limit = 20, type = null } = options;

  const skip = (page - 1) * limit;

  const whereClause = {
    name: {
      contains: query,
      mode: 'insensitive',
    },
    users: {
      some: {
        userId,
        isActive: true,
      },
    },
    isActive: true,
  };

  if (type) {
    whereClause.type = type;
  }

  const chatRooms = await prisma.chatRoom.findMany({
    where: whereClause,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      users: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    skip,
    take: limit,
  });

  const totalChatRooms = await prisma.chatRoom.count({
    where: whereClause,
  });

  return {
    chatRooms,
    pagination: {
      page,
      limit,
      total: totalChatRooms,
      pages: Math.ceil(totalChatRooms / limit),
    },
  };
};

module.exports = {
  createChatRoom,
  getChatRoomById,
  getUserChatRooms,
  addUserToChatRoom,
  removeUserFromChatRoom,
  updateChatRoom,
  deleteChatRoom,
  searchChatRooms,
};
