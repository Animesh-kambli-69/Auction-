// src/controllers/reviewController.js - Review Management

import Review from '../models/Review.js';
import Auction from '../models/Auction.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const createReview = asyncHandler(async (req, res, next) => {
  const { auctionId, rating, comment } = req.body;
  const reviewerId = req.user._id;

  // Check if auction exists and is ended
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (auction.status !== 'ended') {
    return next(new AppError('Can only review ended auctions', 400));
  }

  // Check if user won the auction
  if (auction.winner.toString() !== reviewerId.toString()) {
    return next(new AppError('Only auction winner can leave review', 403));
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    auction: auctionId,
    reviewer: reviewerId,
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this auction', 400));
  }

  // Create review
  const review = await Review.create({
    auction: auctionId,
    reviewer: reviewerId,
    seller: auction.seller,
    rating,
    comment,
  });

  // Update seller's rating in User model
  const reviews = await Review.find({ seller: auction.seller });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await User.findByIdAndUpdate(auction.seller, {
    rating: Math.round(avgRating * 10) / 10,
  });

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    review,
  });
});

export const getAuctionReviews = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  // Check if auction exists
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  const reviews = await Review.find({ auction: auctionId })
    .populate('reviewer', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Review.countDocuments({ auction: auctionId });

  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getSellerReviews = asyncHandler(async (req, res, next) => {
  const { sellerId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  // Check if seller exists
  const seller = await User.findById(sellerId);
  if (!seller) {
    return next(new AppError('Seller not found', 404));
  }

  const reviews = await Review.find({ seller: sellerId })
    .populate('reviewer', 'name avatar')
    .populate('auction', 'title')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Review.countDocuments({ seller: sellerId });
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    reviews,
    avgRating,
    totalReviews: total,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  let review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.reviewer.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to update this review', 403));
  }

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;

  await review.save();

  // Update seller's rating
  const reviews = await Review.find({ seller: review.seller });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await User.findByIdAndUpdate(review.seller, {
    rating: Math.round(avgRating * 10) / 10,
  });

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review,
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.reviewer.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  const sellerId = review.seller;
  await Review.findByIdAndDelete(reviewId);

  // Update seller's rating
  const reviews = await Review.find({ seller: sellerId });
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  await User.findByIdAndUpdate(sellerId, {
    rating: Math.round(avgRating * 10) / 10,
  });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});
