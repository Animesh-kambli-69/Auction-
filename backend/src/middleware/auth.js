// src/middleware/auth.js - JWT Authentication Middleware

import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new AppError('Invalid or expired token', 401));
  }

  req.user = await User.findById(decoded._id);
  if (!req.user) {
    return next(new AppError('User not found', 404));
  }

  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
