const chatRoomService = require('../services/chatRoomService');
const { AppError } = require('../utils/errorHandler');

/**
 * Create a new chat room
 */
const createChatRoom = async (req, res, next) => {
  try {
    const chatRoom = await chatRoomService.createChatRoom(
      req.body,
      req.user.id
    );

    res.status(201).json({
      status: 'success',
      message: 'Chat room created successfully',
      data: { chatRoom },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat room by ID
 */
const getChatRoomById = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;

    const chatRoom = await chatRoomService.getChatRoomById(
      chatRoomId,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      data: { chatRoom },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's chat rooms
 */
const getUserChatRooms = async (req, res, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await chatRoomService.getUserChatRooms(req.user.id, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add user to chat room
 */
const addUserToChatRoom = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const chatRoom = await chatRoomService.addUserToChatRoom(
      chatRoomId,
      userId,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'User added to chat room successfully',
      data: { chatRoom },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove user from chat room
 */
const removeUserFromChatRoom = async (req, res, next) => {
  try {
    const { chatRoomId, userId } = req.params;

    const chatRoom = await chatRoomService.removeUserFromChatRoom(
      chatRoomId,
      userId,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'User removed from chat room successfully',
      data: { chatRoom },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update chat room
 */
const updateChatRoom = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;

    const chatRoom = await chatRoomService.updateChatRoom(
      chatRoomId,
      req.body,
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'Chat room updated successfully',
      data: { chatRoom },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete chat room
 */
const deleteChatRoom = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;

    await chatRoomService.deleteChatRoom(chatRoomId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Chat room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search chat rooms
 */
const searchChatRooms = async (req, res, next) => {
  try {
    const { q: query } = req.query;
    const { page, limit, type } = req.query;

    if (!query) {
      throw new AppError('Search query is required', 400);
    }

    const result = await chatRoomService.searchChatRooms(query, req.user.id, {
      page,
      limit,
      type,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
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
