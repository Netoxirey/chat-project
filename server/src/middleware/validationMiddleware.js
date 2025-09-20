const Joi = require('joi');
const { AppError } = require('../utils/errorHandler');

/**
 * Generic validation middleware
 * @param {Object} schema - Joi schema
 * @param {string} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return next(new AppError(errorMessage, 400));
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  // Message creation
  createMessage: Joi.object({
    content: Joi.string().min(1).max(5000).required().messages({
      'string.min': 'Message content cannot be empty',
      'string.max': 'Message content cannot exceed 5000 characters',
      'any.required': 'Message content is required',
    }),
    type: Joi.string()
      .valid('TEXT', 'IMAGE', 'FILE', 'SYSTEM')
      .default('TEXT')
      .optional(),
    receiverId: Joi.string().optional(),
    chatRoomId: Joi.string().optional(),
  })
    .custom((value, helpers) => {
      // Either receiverId or chatRoomId must be provided, but not both
      if (!value.receiverId && !value.chatRoomId) {
        return helpers.error('custom.eitherReceiverOrChatRoom');
      }
      if (value.receiverId && value.chatRoomId) {
        return helpers.error('custom.bothReceiverAndChatRoom');
      }
      return value;
    })
    .messages({
      'custom.eitherReceiverOrChatRoom':
        'Either receiverId or chatRoomId must be provided',
      'custom.bothReceiverAndChatRoom':
        'Cannot provide both receiverId and chatRoomId',
    }),

  // Chat room creation
  createChatRoom: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.min': 'Chat room name cannot be empty',
      'string.max': 'Chat room name cannot exceed 100 characters',
      'any.required': 'Chat room name is required',
    }),
    description: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid('DIRECT', 'GROUP', 'CHANNEL')
      .default('GROUP')
      .optional(),
    userIds: Joi.array().items(Joi.string()).min(1).optional().messages({
      'array.min': 'At least one user ID must be provided',
    }),
  }),

  // Update user profile
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    avatar: Joi.string().uri().optional(),
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'name')
      .default('createdAt')
      .optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').optional(),
  }),
};

module.exports = {
  validate,
  schemas,
};
