// src/routes/bidRoutes.js - Bidding Routes

import express from 'express';
import { body } from 'express-validator';
import {
  placeBid,
  getBidHistory,
  getMyBids,
  getWonAuctions,
  validateBid,
} from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const bidValidation = [
  body('auctionId').notEmpty().withMessage('Auction ID is required'),
  body('bidAmount').isFloat({ min: 0 }).withMessage('Bid amount must be a positive number'),
];

// Public routes
router.get('/auction/:auctionId', getBidHistory);
router.post('/validate', bidValidation, handleValidationErrors, validateBid);

// Protected routes
router.post('/', protect, bidValidation, handleValidationErrors, placeBid);
router.get('/my-bids', protect, getMyBids);
router.get('/won-auctions', protect, getWonAuctions);

export default router;
