import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  submitReport,
  getReports,
  updateReportStatus,
  openDispute,
  respondToDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute,
  getDisputeById,
  addDisputeMessage
} from '../controllers/trustController.js';

const router = express.Router();

const reportValidation = [
  body('reason').notEmpty().withMessage('Reason is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

const disputeValidation = [
  body('auctionId').notEmpty().withMessage('Auction ID is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

// USER ROUTES
router.post('/report', protect, reportValidation, handleValidationErrors, submitReport);
router.post('/dispute', protect, disputeValidation, handleValidationErrors, openDispute);
router.put('/dispute/:id/respond', protect, body('response').notEmpty().withMessage('Response required'), handleValidationErrors, respondToDispute);
router.get('/dispute/my-disputes', protect, getMyDisputes);
router.get('/dispute/:id', protect, getDisputeById);
router.post('/dispute/:id/message', protect, body('message').notEmpty().withMessage('Message required'), handleValidationErrors, addDisputeMessage);

// ADMIN ROUTES
router.get('/admin/reports', protect, authorize('admin', 'superadmin'), getReports);
router.put('/admin/reports/:id', protect, authorize('admin', 'superadmin'), updateReportStatus);
router.get('/admin/disputes', protect, authorize('admin', 'superadmin'), getAllDisputes);
router.put('/admin/disputes/:id', protect, authorize('admin', 'superadmin'), resolveDispute);

export default router;
