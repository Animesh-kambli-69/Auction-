// src/routes/activityRoutes.js - Activity Feed Routes

import express from 'express';
import { getActivity, getMyActivity, getAuctionActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getActivity);
router.get('/auction/:auctionId', getAuctionActivity);

// Protected routes
router.get('/my-activity', protect, getMyActivity);

export default router;
