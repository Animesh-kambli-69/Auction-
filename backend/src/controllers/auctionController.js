// src/controllers/auctionController.js - Auction Management Logic

import Auction from '../models/Auction.js';
import Activity from '../models/Activity.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const getAllAuctions = asyncHandler(async (req, res, next) => {
  const { category, status, search, limit = 20, offset = 0 } = req.query;

  let filter = { status: 'active' };
  if (status) filter.status = status;
  if (category) filter.category = category;

  let query = Auction.find(filter)
    .populate('seller', 'name avatar rating')
    .populate('currentBidder', 'name avatar')
    .sort({ endDate: 1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  if (search) {
    query = query.find({ $text: { $search: search } });
  }

  const auctions = await query.exec();
  const total = await Auction.countDocuments(filter);

  res.status(200).json({
    success: true,
    auctions,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getAuctionById = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('seller', 'name avatar rating email location')
    .populate('currentBidder', 'name avatar')
    .populate('winner', 'name email');

  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  res.status(200).json({
    success: true,
    auction,
  });
});

export const createAuction = asyncHandler(async (req, res, next) => {
  const { title, subtitle, description, category, condition, startingPrice, reservePrice, increment, endDate, location, images } = req.body;

  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const auction = await Auction.create({
    title,
    subtitle,
    description,
    category,
    condition,
    startingPrice,
    reservePrice,
    currentBid: startingPrice,
    increment,
    endDate,
    location,
    images: images || [],
    seller: req.user._id,
    status: 'pending_approval',
    submittedAt: new Date(),
  });

  await Activity.logActivity(
    'auction_submitted',
    req.user._id,
    auction._id,
    `submitted auction "${title}" for approval`
  );

  res.status(201).json({
    success: true,
    message: 'Auction request submitted and is pending superadmin approval',
    auction,
  });
});

export const getMyListingRequests = asyncHandler(async (req, res, next) => {
  const { limit = 20, offset = 0 } = req.query;

  const listings = await Auction.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Auction.countDocuments({ seller: req.user._id });

  res.status(200).json({
    success: true,
    listings,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const updateAuction = asyncHandler(async (req, res, next) => {
  let auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (auction.seller.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this auction', 403));
  }

  if (auction.status !== 'active') {
    return next(new AppError('Cannot update ended or cancelled auction', 400));
  }

  auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    auction,
  });
});

export const deleteAuction = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (auction.seller.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this auction', 403));
  }

  await Auction.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Auction deleted successfully',
  });
});

export const searchAuctions = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError('Search query is required', 400));
  }

  const auctions = await Auction.find({
    $text: { $search: query },
    status: 'active',
  })
    .populate('seller', 'name avatar')
    .limit(20);

  res.status(200).json({
    success: true,
    auctions,
  });
});
