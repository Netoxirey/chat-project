const prisma = require('../database/connection');
const { AppError } = require('../utils/errorHandler');

/**
 * Get all users (for finding users to chat with)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      id: {
        not: req.user.id, // Exclude current user
      },
    };

    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
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
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get online users
 */
const getOnlineUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await prisma.user.findMany({
      where: {
        isOnline: true,
        id: {
          not: req.user.id, // Exclude current user
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        lastSeen: true,
      },
      orderBy: { lastSeen: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const totalOnlineUsers = await prisma.user.count({
      where: {
        isOnline: true,
        id: {
          not: req.user.id,
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOnlineUsers,
          pages: Math.ceil(totalOnlineUsers / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  getOnlineUsers,
};
