// src/services/bidService.js - Bid Business Logic

import { placeBid, validateBid, getBidHistory } from '../api/bids';

export const BidService = {
  /**
   * Place a new bid
   */
  async placeBid(auctionId, bidAmount) {
    try {
      // Validate bid first
      const validation = await this.validateBid(auctionId, bidAmount);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Place bid
      const response = await placeBid(auctionId, bidAmount);
      return {
        success: true,
        bid: response.bid,
        auction: response.auction,
      };
    } catch (error) {
      throw new Error(`Failed to place bid: ${error.message}`);
    }
  },

  /**
   * Validate bid amount
   */
  async validateBid(auctionId, bidAmount) {
    try {
      const response = await validateBid(auctionId, bidAmount);
      return {
        valid: response.valid,
        message: response.message,
        minimumBid: response.minimumBid,
      };
    } catch (error) {
      throw new Error(`Bid validation failed: ${error.message}`);
    }
  },

  /**
   * Get bid history for auction
   */
  async getBidHistory(auctionId, limit = 20) {
    try {
      const response = await getBidHistory(auctionId, { limit });
      return response.bids || [];
    } catch (error) {
      throw new Error(`Failed to fetch bid history: ${error.message}`);
    }
  },

  /**
   * Check if user is highest bidder
   */
  isHighestBidder(currentBidderId, userId) {
    return currentBidderId === userId;
  },

  /**
   * Format bid for display
   */
  formatBid(bid) {
    return {
      ...bid,
      displayAmount: `$${bid.amount.toLocaleString()}`,
      timeAgo: this.getTimeAgo(bid.createdAt),
    };
  },

  /**
   * Get relative time string
   */
  getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  },

  /**
   * Calculate next minimum bid
   */
  calculateMinimumBid(currentBid, increment) {
    return currentBid + increment;
  },

  /**
   * Validate bid input
   */
  validateBidInput(bidAmount, currentBid, increment) {
    const minimum = currentBid + increment;
    
    if (isNaN(bidAmount)) {
      return { valid: false, message: 'Bid must be a number' };
    }
    
    if (bidAmount < minimum) {
      return {
        valid: false,
        message: `Minimum bid is $${minimum}`,
        minBid: minimum,
      };
    }
    
    return { valid: true, message: 'Bid is valid' };
  },
};

export default BidService;
