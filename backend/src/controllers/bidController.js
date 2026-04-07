// src/controllers/bidController.js - Bidding Logic

import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import Activity from '../models/Activity.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import {
  emitBidPlaced,
  emitOutbidNotification,
  emitActivityCreated,
} from '../config/socket.js';

const ANTI_SNIPE_WINDOW_MS = 2 * 60 * 1000;
const ANTI_SNIPE_EXTENSION_MS = 2 * 60 * 1000;
const DUPLICATE_BID_WINDOW_MS = 10 * 1000;

export const placeBid = asyncHandler(async (req, res, next) => {
  const { auctionId, bidAmount } = req.body;
  const parsedBidAmount = Number(bidAmount);

  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  if (!Number.isFinite(parsedBidAmount) || parsedBidAmount <= 0) {
    return next(new AppError('Bid amount must be a positive number', 400));
  }

  // Find auction
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  const previousBidderId = auction.currentBidder ? auction.currentBidder.toString() : null;
  const previousBidAmount = auction.currentBid;

  // Check if auction is active
  if (!auction.isActive()) {
    return next(new AppError('Auction has ended', 400));
  }

  // Check if user is not the seller
  if (auction.seller.toString() === req.user._id.toString()) {
    return next(new AppError('Seller cannot bid on their own auction', 400));
  }

  // Validate bid amount
  const minimumBid = auction.currentBid + auction.increment;
  if (parsedBidAmount < minimumBid) {
    return next(new AppError(`Minimum bid is ${minimumBid}`, 400));
  }

  // Prevent accidental duplicate submissions in rapid succession
  const latestUserBid = await Bid.findOne({
    auction: auctionId,
    bidder: req.user._id,
  }).sort({ createdAt: -1 });

  if (latestUserBid && latestUserBid.amount === parsedBidAmount) {
    const elapsedMs = Date.now() - new Date(latestUserBid.createdAt).getTime();
    if (elapsedMs < DUPLICATE_BID_WINDOW_MS) {
      return next(
        new AppError('Duplicate bid detected. Please wait a moment before bidding again.', 400)
      );
    }
  }

  // Mark previous highest bid as outbid
  if (previousBidderId) {
    await Bid.findOneAndUpdate(
      {
        auction: auctionId,
        bidder: previousBidderId,
        isHighest: true,
      },
      {
        isHighest: false,
        status: 'outbid',
      },
      {
        sort: { createdAt: -1 },
      }
    );
  }

  // Create new bid
  const bid = await Bid.create({
    amount: parsedBidAmount,
    auction: auctionId,
    bidder: req.user._id,
    isHighest: true,
    ipAddress: req.ip,
  });

  // Update auction
  auction.currentBid = parsedBidAmount;
  auction.currentBidder = req.user._id;
  auction.bidCount += 1;

  let wasExtended = false;
  let extendedUntil = null;

  const timeToEndMs = new Date(auction.endDate).getTime() - Date.now();
  if (timeToEndMs > 0 && timeToEndMs <= ANTI_SNIPE_WINDOW_MS) {
    auction.endDate = new Date(new Date(auction.endDate).getTime() + ANTI_SNIPE_EXTENSION_MS);
    wasExtended = true;
    extendedUntil = auction.endDate;
  }

  const isExistingBidder = auction.bidders.some(
    (bidderId) => bidderId.toString() === req.user._id.toString()
  );

  if (!isExistingBidder) {
    auction.bidders.push(req.user._id);
    auction.bidderCount += 1;
  }

  await auction.save();

  // Log activity
  const activity = await Activity.logActivity(
    'bid_placed',
    req.user._id,
    auctionId,
    `placed a bid on ${auction.title}`,
    { bidAmount: parsedBidAmount }
  );

  // Emit websocket updates
  const io = req.app.locals.io;
  if (io) {
    emitBidPlaced(io, auctionId, {
      bidId: bid._id,
      auctionTitle: auction.title,
      bidAmount: parsedBidAmount,
      currentBid: auction.currentBid,
      bidCount: auction.bidCount,
      bidderCount: auction.bidderCount,
      minimumNextBid: auction.currentBid + auction.increment,
      endDate: auction.endDate,
      wasExtended,
      extendedUntil,
      bidder: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });

    if (activity) {
      emitActivityCreated(io, {
        _id: activity._id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        user: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar,
        },
        auction: {
          _id: auction._id,
          title: auction.title,
        },
      });
    }

    if (previousBidderId && previousBidderId !== req.user._id.toString()) {
      emitOutbidNotification(io, previousBidderId, {
        auctionId: auction._id,
        auctionTitle: auction.title,
        previousBid: previousBidAmount,
        currentBid: parsedBidAmount,
        minimumNextBid: parsedBidAmount + auction.increment,
      });

      await Activity.logActivity(
        'bid_outbid',
        previousBidderId,
        auctionId,
        `was outbid on ${auction.title}`,
        {
          bidAmount: parsedBidAmount,
          previousBidder: req.user._id,
          action: 'outbid_notification_sent',
        }
      );
    }
  }

  res.status(201).json({
    success: true,
    bid,
    auction: {
      currentBid: auction.currentBid,
      bidCount: auction.bidCount,
      bidderCount: auction.bidderCount,
      endDate: auction.endDate,
      wasExtended,
      extendedUntil,
      minimumNextBid: auction.currentBid + auction.increment,
    },
  });
});

export const getBidHistory = asyncHandler(async (req, res, next) => {
  const { auctionId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const bids = await Bid.find({ auction: auctionId })
    .populate('bidder', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Bid.countDocuments({ auction: auctionId });

  res.status(200).json({
    success: true,
    bids,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getMyBids = asyncHandler(async (req, res, next) => {
  const { limit = 20, offset = 0 } = req.query;

  const bids = await Bid.find({ bidder: req.user._id })
    .populate('auction', 'title images currentBid endDate')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  const total = await Bid.countDocuments({ bidder: req.user._id });

  res.status(200).json({
    success: true,
    bids,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getWonAuctions = asyncHandler(async (req, res, next) => {
  const auctions = await Auction.find({
    winner: req.user._id,
  })
    .populate('seller', 'name email');

  res.status(200).json({
    success: true,
    auctions,
  });
});

export const validateBid = asyncHandler(async (req, res, next) => {
  const { auctionId, bidAmount } = req.body;
  const parsedBidAmount = Number(bidAmount);

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return next(new AppError('Auction not found', 404));
  }

  if (!Number.isFinite(parsedBidAmount) || parsedBidAmount <= 0) {
    return res.status(200).json({
      success: true,
      valid: false,
      message: 'Bid amount must be a positive number',
    });
  }

  if (!auction.isActive()) {
    return res.status(200).json({
      success: false,
      valid: false,
      message: 'Auction has ended',
      endDate: auction.endDate,
    });
  }

  const minimumBid = auction.currentBid + auction.increment;
  if (parsedBidAmount < minimumBid) {
    return res.status(200).json({
      success: true,
      valid: false,
      message: `Minimum bid is ${minimumBid}`,
      minimumBid,
      endDate: auction.endDate,
    });
  }

  const timeToEndMs = new Date(auction.endDate).getTime() - Date.now();
  const closingSoon = timeToEndMs > 0 && timeToEndMs <= ANTI_SNIPE_WINDOW_MS;

  res.status(200).json({
    success: true,
    valid: true,
    message: closingSoon
      ? 'Bid is valid. Late bids will extend the auction by 2 minutes.'
      : 'Bid is valid',
    minimumBid,
    currentBid: auction.currentBid,
    increment: auction.increment,
    closingSoon,
    endDate: auction.endDate,
  });
});
