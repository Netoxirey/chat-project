const authService = require('../services/authService');
const { AppError } = require('../utils/errorHandler');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    // Set HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: result.user,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Set new access token cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('accessToken', tokens.accessToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
};
