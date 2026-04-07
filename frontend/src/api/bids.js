// Bidding API endpoints

import { apiCall } from './index';

/**
 * Place a bid on an auction
 * @param {string} auctionId - Auction ID
 * @param {number} bidAmount - Bid amount
 * @returns {Promise} Bid confirmation with updated auction data
 */
export const placeBid = async (auctionId, bidAmount) => {
  return apiCall(`/api/bids`, {
    method: 'POST',
    body: JSON.stringify({ auctionId, bidAmount }),
  });
};

/**
 * Get bid history for an auction
 * @param {string} auctionId - Auction ID
 * @param {object} options - Pagination options (limit, offset)
 * @returns {Promise} Array of bids in reverse chronological order
 */
export const getBidHistory = async (auctionId, options = {}) => {
  const queryParams = new URLSearchParams(options).toString();
  const endpoint = `/api/bids/auction/${auctionId}${queryParams ? `?${queryParams}` : ''}`;
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Get current user's bids
 * @param {object} options - Filter and pagination options
 * @returns {Promise} Array of user's bids
 */
export const getMyBids = async (options = {}) => {
  const queryParams = new URLSearchParams(options).toString();
  const endpoint = `/api/bids/my-bids${queryParams ? `?${queryParams}` : ''}`;
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Get user's winning bids
 * @returns {Promise} Array of won auctions
 */
export const getWonAuctions = async () => {
  return apiCall('/api/bids/won-auctions', { method: 'GET' });
};

/**
 * Validate bid amount for an auction
 * @param {string} auctionId - Auction ID
 * @param {number} bidAmount - Proposed bid amount
 * @returns {Promise} Validation result with message
 */
export const validateBid = async (auctionId, bidAmount) => {
  return apiCall(`/api/bids/validate`, {
    method: 'POST',
    body: JSON.stringify({ auctionId, bidAmount }),
  });
};

/**
 * Get minimum bid for an auction
 * @param {string} auctionId - Auction ID
 * @returns {Promise} Minimum bid amount
 */
export const getMinimumBid = async (auctionId) => {
  return apiCall(`/api/auctions/${auctionId}/minimum-bid`, {
    method: 'GET',
  });
};

/**
 * Cancel or retract a bid (if auction rules allow)
 * @param {string} bidId - Bid ID
 * @returns {Promise} Cancellation confirmation
 */
export const cancelBid = async (bidId) => {
  return apiCall(`/api/bids/${bidId}`, {
    method: 'DELETE',
  });
};
