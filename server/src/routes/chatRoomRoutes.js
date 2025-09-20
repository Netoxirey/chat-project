const express = require('express');
const chatRoomController = require('../controllers/chatRoomController');
const { authenticate } = require('../middleware/unifiedAuthMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Chat room routes
router.post(
  '/',
  validate(schemas.createChatRoom),
  chatRoomController.createChatRoom
);
router.get(
  '/',
  validate(schemas.pagination, 'query'),
  chatRoomController.getUserChatRooms
);
router.get(
  '/search',
  validate(schemas.pagination, 'query'),
  chatRoomController.searchChatRooms
);
router.get('/:chatRoomId', chatRoomController.getChatRoomById);
router.put('/:chatRoomId', chatRoomController.updateChatRoom);
router.delete('/:chatRoomId', chatRoomController.deleteChatRoom);

// Chat room user management
router.post('/:chatRoomId/users', chatRoomController.addUserToChatRoom);
router.delete(
  '/:chatRoomId/users/:userId',
  chatRoomController.removeUserFromChatRoom
);

module.exports = router;
