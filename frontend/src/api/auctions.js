// Auction API endpoints

import { apiCall } from './index';

/**
 * Get all active auctions
 * @param {object} filters - Filter options (category, status, search, etc.)
 * @returns {Promise} Array of auctions
 */
export const getAllAuctions = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/api/auctions${queryParams ? `?${queryParams}` : ''}`;
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Get single auction by ID
 * @param {string} auctionId - Auction ID
 * @returns {Promise} Auction details
 */
export const getAuctionById = async (auctionId) => {
  return apiCall(`/api/auctions/${auctionId}`, { method: 'GET' });
};

/**
 * Create new auction (seller only)
 * @param {object} auctionData - Auction details (title, description, category, reserve, etc.)
 * @returns {Promise} Created auction with ID
 */
export const createAuction = async (auctionData) => {
  return apiCall('/api/auctions', {
    method: 'POST',
    body: JSON.stringify(auctionData),
  });
};

/**
 * Update auction (seller only)
 * @param {string} auctionId - Auction ID
 * @param {object} updates - Fields to update
 * @returns {Promise} Updated auction
 */
export const updateAuction = async (auctionId, updates) => {
  return apiCall(`/api/auctions/${auctionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete auction (seller only)
 * @param {string} auctionId - Auction ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteAuction = async (auctionId) => {
  return apiCall(`/api/auctions/${auctionId}`, {
    method: 'DELETE',
  });
};

/**
 * Search auctions by keyword
 * @param {string} query - Search term
 * @param {object} filters - Additional filters
 * @returns {Promise} Array of matching auctions
 */
export const searchAuctions = async (query, filters = {}) => {
  return getAllAuctions({ ...filters, search: query });
};

/**
 * Filter auctions by category
 * @param {string} category - Category name
 * @returns {Promise} Array of auctions in category
 */
export const getAuctionsByCategory = async (category) => {
  return getAllAuctions({ category });
};

/**
 * Get auctions ending soon
 * @param {number} hoursAhead - Number of hours to look ahead
 * @returns {Promise} Array of auctions ending soon
 */
export const getEndingSoonAuctions = async (hoursAhead = 24) => {
  return getAllAuctions({ endingSoon: hoursAhead });
};

/**
 * Get auctions created by current user (seller)
 * @returns {Promise} Array of user's auctions
 */
export const getMyAuctions = async () => {
  return apiCall('/api/auctions/my-auctions', { method: 'GET' });
};
