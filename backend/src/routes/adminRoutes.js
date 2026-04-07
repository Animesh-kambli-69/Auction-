// src/routes/adminRoutes.js - Admin Routes

import express from 'express';
import { body } from 'express-validator';
import {
  getPendingAuctions,
  getAuctionsByStatus,
  approveAuction,
  rejectAuction,
  getAdminStats,
  getAllUsers,
  getUserActivity,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All routes require admin or superadmin role
router.use(protect, authorize('admin', 'superadmin'));

// ==================== AUCTION MANAGEMENT ====================
router.get('/auctions/pending', getPendingAuctions);
router.get('/auctions/status', getAuctionsByStatus);
router.post(
  '/auctions/:id/approve',
  [
    body('notes').optional().isString(),
  ],
  handleValidationErrors,
  approveAuction
);
router.post(
  '/auctions/:id/reject',
  [body('reason').trim().notEmpty().withMessage('Rejection reason is required')],
  handleValidationErrors,
  rejectAuction
);

// ==================== STATISTICS ====================
router.get('/stats', getAdminStats);

// ==================== USER MANAGEMENT ====================
router.get('/users', getAllUsers);
router.get('/users/:userId/activity', getUserActivity);

export default router;
