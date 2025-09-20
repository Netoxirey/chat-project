const express = require('express');
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validationMiddleware');
const {
  authenticateWithCookie,
  optionalCookieAuth,
} = require('../middleware/cookieAuthMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (using cookie authentication)
router.use(authenticateWithCookie); // All routes below require cookie authentication
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put(
  '/profile',
  validate(schemas.updateProfile),
  authController.updateProfile
);

module.exports = router;
