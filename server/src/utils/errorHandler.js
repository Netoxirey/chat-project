/**
 * Custom Error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle different types of errors
 */
const handleError = (err, req, res, _unusedNext) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'A record with this information already exists';
    error = new AppError(message, 400);
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new AppError(message, 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  sendErrorResponse(error, req, res);
};

/**
 * Send error response
 */
const sendErrorResponse = (err, _req, res) => {
  const { statusCode = 500, status = 'error', message } = err;

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  handleError(err, req, res, next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
};
