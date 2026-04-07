// Activity Model Schema

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['bid_placed', 'auction_won', 'auction_created', 'auction_ended', 'item_watched', 'bid_outbid'],
      required: true,
    },
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
    description: {
      type: String,
      required: true,
    },
    metadata: {
      bidAmount: {
        type: Number,
        default: null,
      },
      previousBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      action: {
        type: String,
        default: null,
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ auction: 1, createdAt: -1 });
activitySchema.index({ isPublic: 1, createdAt: -1 });

// Static method to create activity log
activitySchema.statics.logActivity = async function (type, userId, auctionId, description, metadata = {}) {
  try {
    const activity = await this.create({
      type,
      user: userId,
      auction: auctionId,
      description,
      metadata,
    });
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = mongoose.model('Activity', activitySchema);
