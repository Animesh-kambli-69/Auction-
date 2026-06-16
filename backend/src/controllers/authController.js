// src/controllers/authController.js - Authentication Logic

import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new AppError('Email already in use', 400));
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');
  user = await User.create({ name, email, password, verificationToken });

  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
  const message = `Please verify your email by making a GET request to: \n\n ${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message,
    });
  } catch (error) {
    console.error('Email could not be sent', error);
  }

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
      isVerified: user.isVerified,
    },
  });
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ verificationToken: req.params.token });

  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  // Redirect to frontend or send success
  res.redirect('http://localhost:5173/login?verified=true');
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

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Note: the frontend URL for password reset
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
  });
});
