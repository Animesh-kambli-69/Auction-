// src/services/auctionService.js - Auction Business Logic

import { getAllAuctions, getAuctionById, createAuction, updateAuction, deleteAuction } from '../api/auctions';

export const AuctionService = {
  /**
   * Get all active auctions
   */
  async getActiveAuctions(filters = {}) {
    try {
      const response = await getAllAuctions({ ...filters, status: 'active' });
      return response.auctions || [];
    } catch (error) {
      throw new Error(`Failed to fetch auctions: ${error.message}`);
    }
  },

  /**
   * Get auction with full details
   */
  async getAuctionDetails(auctionId) {
    try {
      const response = await getAuctionById(auctionId);
      return response.auction;
    } catch (error) {
      throw new Error(`Failed to fetch auction: ${error.message}`);
    }
  },

  /**
   * Create new auction
   */
  async createNewAuction(auctionData) {
    try {
      const response = await createAuction(auctionData);
      return response.auction;
    } catch (error) {
      throw new Error(`Failed to create auction: ${error.message}`);
    }
  },

  /**
   * Update existing auction
   */
  async updateExistingAuction(auctionId, updates) {
    try {
      const response = await updateAuction(auctionId, updates);
      return response.auction;
    } catch (error) {
      throw new Error(`Failed to update auction: ${error.message}`);
    }
  },

  /**
   * Delete auction
   */
  async deleteAuctionById(auctionId) {
    try {
      await deleteAuction(auctionId);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete auction: ${error.message}`);
    }
  },

  /**
   * Check if auction is still active
   */
  isAuctionActive(auction) {
    return auction.status === 'active' && new Date() < new Date(auction.endDate);
  },

  /**
   * Calculate time remaining
   */
  getTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isEnded: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isEnded: false };
  },

  /**
   * Format auction for display
   */
  formatAuction(auction) {
    return {
      ...auction,
      displayPrice: `$${auction.currentBid.toLocaleString()}`,
      minimumNextBid: auction.currentBid + auction.increment,
      isActive: this.isAuctionActive(auction),
      timeRemaining: this.getTimeRemaining(auction.endDate),
    };
  },
};

export default AuctionService;
