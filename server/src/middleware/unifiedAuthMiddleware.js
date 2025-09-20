const { verifyToken } = require('../utils/jwt');
const prisma = require('../database/connection');
const { AppError } = require('../utils/errorHandler');

/**
 * Unified authentication middleware
 * Checks for JWT token in both Authorization header and HTTP-only cookies
 * Priority: Header first, then cookie
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // First, try to get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If no token in header, try to get from cookie
    if (!token) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid token', 401));
    }
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't throw error if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    // First, try to get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If no token in header, try to get from cookie
    if (!token) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
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
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
