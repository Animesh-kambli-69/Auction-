// server/src/models/Auction.js - Auction Model

import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an auction title'],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: 10,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Gaming', 'Furniture', 'Audio', 'Watches', 'Antiques', 'Electronics', 'Art', 'Other'],
    },
    condition: {
      type: String,
      enum: ['Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'For Parts'],
      default: 'Good',
    },
    startingPrice: {
      type: Number,
      required: [true, 'Please provide a starting price'],
      min: 0,
    },
    reservePrice: {
      type: Number,
      min: 0,
      default: null,
    },
    currentBid: {
      type: Number,
      default: function () {
        return this.startingPrice;
      },
    },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    increment: {
      type: Number,
      required: true,
      default: 25,
      min: 1,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      default: 'Virtual',
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'active', 'ended', 'rejected', 'cancelled'],
      default: 'pending_approval',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvalNotes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: 500,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
      transactionId: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
      shippingAddress: {
        type: String,
      },
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    bidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bidderCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    accent: {
      type: String,
      default: 'sunset',
    },
  },
  { timestamps: true }
);

auctionSchema.index({ category: 1, status: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ endDate: 1 });
auctionSchema.index({ title: 'text', description: 'text' });

auctionSchema.methods.isActive = function () {
  return this.status === 'active' && new Date() < new Date(this.endDate);
};

auctionSchema.methods.endAuction = function () {
  this.status = 'ended';
  if (this.currentBidder) {
    this.winner = this.currentBidder;
  }
  return this.save();
};

export default mongoose.model('Auction', auctionSchema);
