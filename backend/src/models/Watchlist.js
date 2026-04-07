// src/models/Watchlist.js - Watchlist Model

import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notifyOnBid: {
      type: Boolean,
      default: true,
    },
    notifyOnEnding: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure unique constraint: user can only watchlist an auction once
watchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);
