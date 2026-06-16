import Report from '../models/Report.js';
import Dispute from '../models/Dispute.js';
import Auction from '../models/Auction.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

// ---- REPORTS ----

export const submitReport = asyncHandler(async (req, res, next) => {
  const { reportedUser, reportedAuction, reason, description } = req.body;

  if (!reportedUser && !reportedAuction) {
    return next(new AppError('Must report either a user or an auction', 400));
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser,
    reportedAuction,
    reason,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Our team will review it shortly.',
    report,
  });
});

export const getReports = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const reports = await Report.find(filter)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedAuction', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    reports,
  });
});

export const updateReportStatus = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  report.status = status || report.status;
  report.adminNotes = adminNotes || report.adminNotes;
  
  if (['dismissed', 'action_taken'].includes(status)) {
    report.resolvedBy = req.user._id;
    report.resolvedAt = Date.now();
  }

  await report.save();

  res.status(200).json({
    success: true,
    report,
  });
});

// ---- DISPUTES ----

export const openDispute = asyncHandler(async (req, res, next) => {
  const { auctionId, reason, description } = req.body;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (String(auction.winner) !== String(req.user._id)) {
    return next(new AppError('Only the winner can open a dispute for this auction', 403));
  }

  const existingDispute = await Dispute.findOne({ auction: auctionId });
  if (existingDispute) {
    return next(new AppError('A dispute is already open for this auction', 400));
  }

  const dispute = await Dispute.create({
    auction: auctionId,
    buyer: req.user._id,
    seller: auction.seller,
    reason,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Dispute opened successfully. The seller has been notified.',
    dispute,
  });
});

export const respondToDispute = asyncHandler(async (req, res, next) => {
  const { response } = req.body;

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  if (String(dispute.seller) !== String(req.user._id)) {
    return next(new AppError('Only the seller can respond to this dispute', 403));
  }

  dispute.sellerResponse = response;
  dispute.sellerRespondedAt = Date.now();
  dispute.status = 'seller_responded';

  await dispute.save();

  res.status(200).json({
    success: true,
    dispute,
  });
});

export const getMyDisputes = asyncHandler(async (req, res, next) => {
  const disputes = await Dispute.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }]
  })
    .populate('auction', 'title images')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    disputes,
  });
});

export const getAllDisputes = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const disputes = await Dispute.find(filter)
    .populate('auction', 'title')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    disputes,
  });
});

export const resolveDispute = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  dispute.status = status || dispute.status;
  dispute.adminNotes = adminNotes || dispute.adminNotes;
  
  if (['resolved_buyer_refunded', 'resolved_seller_paid', 'dismissed'].includes(status)) {
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = Date.now();
  }

  await dispute.save();

  res.status(200).json({
    success: true,
    dispute,
  });
});

export const getDisputeById = asyncHandler(async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('auction', 'title images')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('messages.sender', 'name role');

  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  // Ensure user is authorized to view this dispute
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'superadmin' &&
    String(dispute.buyer._id) !== String(req.user._id) &&
    String(dispute.seller._id) !== String(req.user._id)
  ) {
    return next(new AppError('Not authorized to view this dispute', 403));
  }

  res.status(200).json({
    success: true,
    dispute,
  });
});

export const addDisputeMessage = asyncHandler(async (req, res, next) => {
  const { message, attachmentUrl } = req.body;
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    return next(new AppError('Dispute not found', 404));
  }

  // Ensure user is authorized
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'superadmin' &&
    String(dispute.buyer) !== String(req.user._id) &&
    String(dispute.seller) !== String(req.user._id)
  ) {
    return next(new AppError('Not authorized to comment on this dispute', 403));
  }

  dispute.messages.push({
    sender: req.user._id,
    role: req.user.role,
    message,
    attachmentUrl,
  });

  // If user is admin, change status to admin_mediating if it's not already closed
  if ((req.user.role === 'admin' || req.user.role === 'superadmin') && ['open', 'seller_responded'].includes(dispute.status)) {
    dispute.status = 'admin_mediating';
  }

  await dispute.save();

  // Return populated dispute
  const populatedDispute = await Dispute.findById(dispute._id)
    .populate('auction', 'title images')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('messages.sender', 'name role');

  res.status(200).json({
    success: true,
    dispute: populatedDispute,
  });
});
