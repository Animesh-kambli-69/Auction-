import express from 'express';
import { body } from 'express-validator';
import { createSiteReview, getSiteReviews } from '../controllers/siteReviewController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
];

router.get('/', getSiteReviews);
router.post('/', protect, reviewValidation, handleValidationErrors, createSiteReview);

export default router;
