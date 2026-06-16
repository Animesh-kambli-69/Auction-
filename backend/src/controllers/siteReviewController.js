import SiteReview from '../models/SiteReview.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const createSiteReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const reviewerId = req.user._id;

  const review = await SiteReview.create({
    reviewer: reviewerId,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review,
  });
});

export const getSiteReviews = asyncHandler(async (req, res, next) => {
  const { limit = 10, offset = 0 } = req.query;

  const reviews = await SiteReview.find()
    .populate('reviewer', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await SiteReview.countDocuments();

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
