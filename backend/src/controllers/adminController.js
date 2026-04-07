// src/controllers/adminController.js - Admin Management

import Auction from '../models/Auction.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Bid from '../models/Bid.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { emitActivityCreated } from '../config/socket.js';

// Get all pending approval auctions
export const getPendingAuctions = asyncHandler(async (req, res, next) => {
  const { limit = 20, offset = 0 } = req.query;

  const auctions = await Auction.find({ status: 'pending_approval' })
    .populate('seller', 'name email avatar')
    .sort({ submittedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Auction.countDocuments({ status: 'pending_approval' });

  res.status(200).json({
    success: true,
    auctions,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

// Get auctions by status
export const getAuctionsByStatus = asyncHandler(async (req, res, next) => {
  const { status = 'active', limit = 20, offset = 0 } = req.query;

  const validStatuses = ['pending_approval', 'approved', 'active', 'ended', 'rejected', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const auctions = await Auction.find({ status })
    .populate('seller', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Auction.countDocuments({ status });

  res.status(200).json({
    success: true,
    auctions,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

// Approve auction and make it live
export const approveAuction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { notes = '' } = req.body;

  // Find auction
  const auction = await Auction.findById(id);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (auction.status !== 'pending_approval') {
    return next(new AppError('Only pending auctions can be approved', 400));
  }

  // Update auction
  auction.status = 'active';
  auction.startDate = new Date();
  auction.approvedBy = req.user._id;
  auction.approvalNotes = notes;
  auction.approvedAt = new Date();
  auction.rejectionReason = '';
  auction.rejectedAt = null;

  await auction.save();

  // Log activity
  await Activity.logActivity(
    'auction_approved',
    req.user._id,
    auction._id,
    `approved auction: ${auction.title}`,
    { approvedAt: auction.approvedAt }
  );

  // Emit WebSocket event
  const io = req.app.locals.io;
  if (io) {
    emitActivityCreated(io, {
      type: 'auction_approved',
      user: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
      auction: {
        _id: auction._id,
        title: auction.title,
      },
      description: `${req.user.name} approved auction`,
      metadata: {
        approvedAt: auction.approvedAt,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Auction approved successfully',
    auction,
  });
});

// Reject auction
export const rejectAuction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason = 'No reason provided' } = req.body;

  const auction = await Auction.findById(id);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (auction.status !== 'pending_approval') {
    return next(new AppError('Only pending auctions can be rejected', 400));
  }

  // Update auction
  auction.status = 'rejected';
  auction.rejectionReason = reason;
  auction.rejectedAt = new Date();
  auction.approvedBy = req.user._id;
  auction.approvalNotes = `Rejected by superadmin: ${reason}`;

  await auction.save();

  // Log activity
  await Activity.logActivity(
    'auction_rejected',
    req.user._id,
    auction._id,
    `rejected auction: ${auction.title}`,
    { reason }
  );

  res.status(200).json({
    success: true,
    message: 'Auction rejected successfully',
    auction,
  });
});

// Get admin dashboard statistics
export const getAdminStats = asyncHandler(async (req, res, next) => {
  const [
    activeAuctionsCount,
    totalBidsCount,
    totalUsersCount,
    pendingAuctionsCount,
    endedAuctionsCount,
  ] = await Promise.all([
    Auction.countDocuments({ status: 'active' }),
    Bid.countDocuments(),
    User.countDocuments(),
    Auction.countDocuments({ status: 'pending_approval' }),
    Auction.countDocuments({ status: 'ended' }),
  ]);

  // Calculate total revenue (sum of all bids)
  const revenueData = await Bid.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // Get recent activities
  const recentActivities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'name avatar')
    .populate('auction', 'title');

  res.status(200).json({
    success: true,
    stats: {
      activeAuctionsCount,
      totalBidsCount,
      totalUsersCount,
      pendingAuctionsCount,
      endedAuctionsCount,
      totalRevenue,
      activeCount: activeAuctionsCount,
      totalBids: totalBidsCount,
      totalUsers: totalUsersCount,
      pendingCount: pendingAuctionsCount,
    },
    recentActivities,
  });
});

// Get all users with filters
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { role = null, limit = 20, offset = 0 } = req.query;

  const query = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

// Get user's auction activity
export const getUserActivity = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  // Get user's auctions
  const auctions = await Auction.find({ seller: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  // Get user's bids
  const bids = await Bid.find({ bidder: userId })
    .populate('auction', 'title currentBid')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  // Get user info
  const user = await User.findById(userId).select('-password');

  res.status(200).json({
    success: true,
    user,
    auctions,
    bids,
  });
});
