const { verifyToken } = require('../utils/jwt');
const prisma = require('../database/connection');
const { AppError } = require('../utils/errorHandler');

/**
 * Cookie-based authentication middleware
 * Reads JWT token from HTTP-only cookies
 */
const authenticateWithCookie = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.accessToken;

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
 * Optional cookie authentication middleware
 * Similar to authenticateWithCookie but doesn't throw error if no token provided
 */
const optionalCookieAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

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
  authenticateWithCookie,
  optionalCookieAuth,
};
