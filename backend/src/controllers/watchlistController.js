// src/controllers/watchlistController.js - Watchlist Management

import Watchlist from '../models/Watchlist.js';
import Auction from '../models/Auction.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const addToWatchlist = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.body;
  const userId = req.user._id;

  // Check if auction exists
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  // Check if already in watchlist
  let watchlistItem = await Watchlist.findOne({ user: userId, auction: auctionId });
  if (watchlistItem) {
    return res.status(200).json({
      success: true,
      message: 'Already in watchlist',
      isWatchlisted: true,
    });
  }

  // Add to watchlist
  watchlistItem = await Watchlist.create({
    user: userId,
    auction: auctionId,
  });

  res.status(201).json({
    success: true,
    message: 'Added to watchlist',
    isWatchlisted: true,
  });
});

export const removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const userId = req.user._id;

  const watchlistItem = await Watchlist.findOneAndDelete({
    user: userId,
    auction: auctionId,
  });

  if (!watchlistItem) {
    return next(new AppError('Item not in watchlist', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Removed from watchlist',
    isWatchlisted: false,
  });
});

export const getWatchlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { limit = 20, offset = 0 } = req.query;

  const watchlistItems = await Watchlist.find({ user: userId })
    .populate('auction')
    .sort({ addedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Watchlist.countDocuments({ user: userId });

  res.status(200).json({
    success: true,
    watchlistItems,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const isWatchlisted = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const userId = req.user._id;

  const watchlistItem = await Watchlist.findOne({
    user: userId,
    auction: auctionId,
  });

  res.status(200).json({
    success: true,
    isWatchlisted: !!watchlistItem,
  });
});

export const toggleWatchlist = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.body;
  const userId = req.user._id;

  // Check if auction exists
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  const watchlistItem = await Watchlist.findOne({
    user: userId,
    auction: auctionId,
  });

  if (watchlistItem) {
    // Remove from watchlist
    await Watchlist.findByIdAndDelete(watchlistItem._id);
    res.status(200).json({
      success: true,
      message: 'Removed from watchlist',
      isWatchlisted: false,
    });
  } else {
    // Add to watchlist
    await Watchlist.create({
      user: userId,
      auction: auctionId,
    });
    res.status(201).json({
      success: true,
      message: 'Added to watchlist',
      isWatchlisted: true,
    });
  }
});
