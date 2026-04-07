// src/routes/reviewRoutes.js - Review Routes

import express from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getAuctionReviews,
  getSellerReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be max 500 characters'),
];

// Public routes
router.get('/auction/:auctionId', getAuctionReviews);
router.get('/seller/:sellerId', getSellerReviews);

// Protected routes
router.post('/', protect, reviewValidation, handleValidationErrors, createReview);
router.put('/:reviewId', protect, reviewValidation, handleValidationErrors, updateReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;
