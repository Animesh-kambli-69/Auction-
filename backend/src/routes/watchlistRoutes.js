// src/routes/watchlistRoutes.js - Watchlist Routes

import express from 'express';
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  isWatchlisted,
  toggleWatchlist,
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All watchlist routes are protected
router.use(protect);

router.post('/add', addToWatchlist);
router.post('/toggle', toggleWatchlist);
router.delete('/:auctionId', removeFromWatchlist);
router.get('/', getWatchlist);
router.get('/:auctionId/check', isWatchlisted);

export default router;
