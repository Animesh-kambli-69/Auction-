// src/controllers/auctionController.js - Auction Management Logic

import Auction from '../models/Auction.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

const parseNonNegativeInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveSortOption = (sort) => {
  const sortMap = {
    newest: { createdAt: -1 },
    latest: { createdAt: -1 },
    'price-asc': { currentBid: 1 },
    'price-desc': { currentBid: -1 },
    'ending-soon': { endDate: 1 },
    'most-bids': { bidCount: -1 },
    'most-viewed': { views: -1 },
  };

  return sortMap[sort] || { endDate: 1 };
};

export const getAllAuctions = asyncHandler(async (req, res, next) => {
  const {
    category,
    status,
    search,
    condition,
    priceMin,
    priceMax,
    endingSoon,
    sellerMinRating,
    sort,
    limit = 20,
    offset = 0,
  } = req.query;

  const parsedLimit = Math.min(parseNonNegativeInteger(limit, 20) || 20, 100);
  const parsedOffset = parseNonNegativeInteger(offset, 0);
  const parsedMinPrice = parseOptionalNumber(priceMin);
  const parsedMaxPrice = parseOptionalNumber(priceMax);
  const parsedEndingSoonHours = parseOptionalNumber(endingSoon);
  const parsedSellerMinRating = parseOptionalNumber(sellerMinRating);

  const filter = {
    status: status || 'active',
  };

  if (category) {
    filter.category = category;
  }

  if (condition) {
    filter.condition = condition;
  }

  if (parsedMinPrice !== null || parsedMaxPrice !== null) {
    filter.currentBid = {};
    if (parsedMinPrice !== null) {
      filter.currentBid.$gte = parsedMinPrice;
    }
    if (parsedMaxPrice !== null) {
      filter.currentBid.$lte = parsedMaxPrice;
    }
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }

  if (parsedEndingSoonHours !== null && parsedEndingSoonHours > 0) {
    const now = new Date();
    const endingSoonCutoff = new Date(now.getTime() + parsedEndingSoonHours * 60 * 60 * 1000);

    filter.endDate = {
      ...(filter.endDate || {}),
      $gt: now,
      $lte: endingSoonCutoff,
    };
  }

  if (parsedSellerMinRating !== null && parsedSellerMinRating > 0) {
    const sellers = await User.find({
      rating: { $gte: parsedSellerMinRating },
    }).select('_id');

    filter.seller = {
      $in: sellers.map((seller) => seller._id),
    };
  }

  const sortOption = resolveSortOption(sort);

  const auctions = await Auction.find(filter)
    .populate('seller', 'name avatar rating')
    .populate('currentBidder', 'name avatar')
    .sort(sortOption)
    .limit(parsedLimit)
    .skip(parsedOffset);

  const total = await Auction.countDocuments(filter);

  res.status(200).json({
    success: true,
    auctions,
    pagination: {
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      pages: Math.ceil(total / parsedLimit),
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

export const getMyAuctions = asyncHandler(async (req, res, next) => {
  const { status, limit = 20, offset = 0, sort } = req.query;

  const parsedLimit = Math.min(parseNonNegativeInteger(limit, 20) || 20, 100);
  const parsedOffset = parseNonNegativeInteger(offset, 0);

  const filter = {
    seller: req.user._id,
  };

  if (status && status !== 'all') {
    filter.status = status;
  }

  const auctions = await Auction.find(filter)
    .populate('currentBidder', 'name avatar')
    .sort(resolveSortOption(sort || 'newest'))
    .limit(parsedLimit)
    .skip(parsedOffset);

  const total = await Auction.countDocuments(filter);

  res.status(200).json({
    success: true,
    auctions,
    pagination: {
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      pages: Math.ceil(total / parsedLimit),
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

export const getMinimumBid = asyncHandler(async (req, res, next) => {
  const auction = await Auction.findById(req.params.id).select(
    'currentBid increment endDate status'
  );

  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  const minimumBid = auction.currentBid + auction.increment;

  res.status(200).json({
    success: true,
    auctionId: auction._id,
    isActive: auction.isActive(),
    currentBid: auction.currentBid,
    increment: auction.increment,
    minimumBid,
    endDate: auction.endDate,
  });
});

export const searchAuctions = asyncHandler(async (req, res, next) => {
  const query = req.query.query || req.query.q || req.query.search;

  if (!query || !query.trim()) {
    return next(new AppError('Search query is required', 400));
  }

  req.query.search = query.trim();
  req.query.status = req.query.status || 'active';

  return getAllAuctions(req, res, next);
});

export const processPayment = asyncHandler(async (req, res, next) => {
  const { address } = req.body;
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (auction.status !== 'ended') {
    return next(new AppError('Auction is not ended yet', 400));
  }

  if (!auction.winner || auction.winner.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the winner can pay for this auction', 403));
  }

  if (auction.payment?.status === 'paid') {
    return next(new AppError('This auction has already been paid for', 400));
  }

  // Simulate Stripe payment processing
  auction.payment = {
    status: 'paid',
    transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
    paidAt: new Date(),
    shippingAddress: address || 'No address provided',
  };

  await auction.save();

  await Activity.logActivity(
    'payment_completed',
    req.user._id,
    auction._id,
    `completed payment for auction "${auction.title}"`
  );

  res.status(200).json({
    success: true,
    message: 'Payment successful',
    payment: auction.payment,
  });
});
