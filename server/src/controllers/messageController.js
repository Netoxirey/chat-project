const messageService = require('../services/messageService');
const { AppError } = require('../utils/errorHandler');
const { emitToChatRoom, emitToUser } = require('../socket/socketHandler');

/**
 * Send a message
 */
const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.sendMessage(req.body, req.user.id);

    // Emit real-time event so receivers update without refresh
    try {
      const { chatRoomId, receiverId } = message;
      if (chatRoomId) {
        emitToChatRoom(chatRoomId, 'new_message', { message, chatRoomId });
      } else if (receiverId) {
        emitToUser(receiverId, 'new_message', { message, receiverId });
      }
    } catch (_emitErr) {
      // Ignore emit errors to not affect HTTP response
    }

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat room messages
 */
const getChatRoomMessages = async (req, res, next) => {
  try {
    const { chatRoomId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await messageService.getChatRoomMessages(
      chatRoomId,
      req.user.id,
      { page, limit, sortBy, sortOrder }
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get direct messages between two users
 */
const getDirectMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await messageService.getDirectMessages(req.user.id, userId, {
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
 * Mark messages as read
 */
const markMessagesAsRead = async (req, res, next) => {
  try {
    const { chatRoomId, senderId } = req.body;

    const count = await messageService.markMessagesAsRead(
      req.user.id,
      chatRoomId,
      senderId
    );

    res.status(200).json({
      status: 'success',
      message: `${count} messages marked as read`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit a message
 */
const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    const message = await messageService.editMessage(
      messageId,
      req.user.id,
      content
    );

    res.status(200).json({
      status: 'success',
      message: 'Message updated successfully',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    await messageService.deleteMessage(messageId, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatRoomMessages,
  getDirectMessages,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
};
