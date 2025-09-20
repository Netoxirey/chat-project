const prisma = require('../database/connection');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateTokens } = require('../utils/jwt');
const { AppError } = require('../utils/errorHandler');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User and tokens
 */
const register = async userData => {
  const { email, username, password, firstName, lastName } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError('Email already registered', 400);
    }
    if (existingUser.username === username) {
      throw new AppError('Username already taken', 400);
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    },
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

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user,
    ...tokens,
  };
};

/**
 * Login user
 * @param {Object} loginData - Login credentials
 * @returns {Promise<Object>} User and tokens
 */
const login = async loginData => {
  const { email, password } = loginData;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update user online status
  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true, lastSeen: new Date() },
  });

  // Remove password from user object
  const { password: _unusedPassword, ...userWithoutPassword } = user;

  // Generate tokens
  const tokens = generateTokens(userWithoutPassword);

  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

/**
 * Logout user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const logout = async userId => {
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: false, lastSeen: new Date() },
  });
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
const refreshToken = async refreshToken => {
  const { verifyToken } = require('../utils/jwt');

  try {
    const decoded = verifyToken(refreshToken);

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

    const tokens = generateTokens(user);
    return tokens;
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getProfile = async userId => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Profile update data
 * @returns {Promise<Object>} Updated user profile
 */
const updateProfile = async (userId, updateData) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
      updatedAt: true,
    },
  });

  return user;
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
};
