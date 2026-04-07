// src/controllers/authController.js - Authentication Logic

import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new AppError('Email already in use', 400));
  }

  user = await User.create({ name, email, password });

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar, bio, location, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar, bio, location, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  // Token invalidation can be handled on client side
  // Or implement token blacklist in production
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
