// src/routes/auctionRoutes.js - Auction Routes

import express from 'express';
import { body } from 'express-validator';
import {
  getAllAuctions,
  getAuctionById,
  createAuction,
  getMyListingRequests,
  updateAuction,
  deleteAuction,
  searchAuctions,
} from '../controllers/auctionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 150 }).withMessage('Title must be 5-150 characters'),
  body('description').notEmpty().withMessage('Description is required').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('startingPrice').isFloat({ min: 0 }).withMessage('Starting price must be a positive number'),
  body('increment').isFloat({ min: 0 }).withMessage('Increment must be a positive number'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
];

// Public routes
router.get('/', getAllAuctions);
router.get('/search', searchAuctions);
router.get('/my-requests', protect, getMyListingRequests);
router.get('/:id', getAuctionById);

// Protected routes
router.post('/', protect, createValidation, handleValidationErrors, createAuction);
router.put('/:id', protect, updateAuction);
router.delete('/:id', protect, deleteAuction);

export default router;
