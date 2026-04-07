// server/src/models/Bid.js - Bid Model

import mongoose from 'mongoose';

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
  },
  { timestamps: true }
);

bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ isHighest: 1, auction: 1 });

export default mongoose.model('Bid', bidSchema);
