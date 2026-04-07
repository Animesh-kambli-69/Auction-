// Bid Model Schema

const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please provide a bid amount'],
      min: 0,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isHighest: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'outbid', 'won', 'cancelled'],
      default: 'active',
    },
    ipAddress: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ isHighest: 1, auction: 1 });

// Method to validate minimum bid
bidSchema.statics.validateMinimumBid = async function (auctionId, bidAmount) {
  const auction = await mongoose.model('Auction').findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found');
  }

  if (!auction.isActive()) {
    throw new Error('Auction has ended');
  }

  const minimumBid = auction.currentBid + auction.increment;
  if (bidAmount < minimumBid) {
    throw new Error(`Minimum bid is ${minimumBid}`);
  }

  return true;
};

module.exports = mongoose.model('Bid', bidSchema);
