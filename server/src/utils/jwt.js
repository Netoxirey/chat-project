const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Tokens object
 */
const generateTokens = user => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const accessToken = generateToken(payload, JWT_EXPIRES_IN);
  const refreshToken = generateToken(payload, JWT_REFRESH_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = token => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  generateTokens,
  verifyToken,
  decodeToken,
};
