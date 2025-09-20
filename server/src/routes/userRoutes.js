const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/unifiedAuthMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', validate(schemas.pagination, 'query'), userController.getUsers);
router.get(
  '/online',
  validate(schemas.pagination, 'query'),
  userController.getOnlineUsers
);
router.get('/:userId', userController.getUserById);

module.exports = router;
