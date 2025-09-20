const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/unifiedAuthMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Message routes
router.post(
  '/',
  validate(schemas.createMessage),
  messageController.sendMessage
);
router.get(
  '/chat-room/:chatRoomId',
  validate(schemas.pagination, 'query'),
  messageController.getChatRoomMessages
);
router.get(
  '/direct/:userId',
  validate(schemas.pagination, 'query'),
  messageController.getDirectMessages
);
router.put('/mark-read', messageController.markMessagesAsRead);
router.put('/:messageId', messageController.editMessage);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
