// src/middleware/validation.js - Request Validation Middleware

import { validationResult } from 'express-validator';
import { AppError } from '../utils/errorHandler.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};
