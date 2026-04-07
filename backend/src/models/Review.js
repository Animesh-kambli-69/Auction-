// src/models/Review.js - Review Model

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure only one review per auction (reviewer can only review once)
reviewSchema.index({ auction: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ seller: 1 });

export default mongoose.model('Review', reviewSchema);
