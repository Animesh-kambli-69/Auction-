// Activity Feed API endpoints

import { apiCall } from './index';

/**
 * Get recent activity feed
 * @param {object} options - Filter and pagination options
 * @returns {Promise} Array of activity items
 */
export const getActivity = async (options = {}) => {
  const queryParams = new URLSearchParams(options).toString();
  const endpoint = `/api/activity${queryParams ? `?${queryParams}` : ''}`;
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Get activity for a specific auction
 * @param {string} auctionId - Auction ID
 * @param {object} options - Pagination options
 * @returns {Promise} Array of activity items for auction
 */
export const getAuctionActivity = async (auctionId, options = {}) => {
  const queryParams = new URLSearchParams(options).toString();
  const endpoint = `/api/auctions/${auctionId}/activity${queryParams ? `?${queryParams}` : ''}`;
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Get activity for current user
 * @param {object} options - Filter and pagination options
 * @returns {Promise} Array of user's activity
 */
export const getMyActivity = async (options = {}) => {
  const queryParams = new URLSearchParams(options).toString();
  const endpoint = `/api/activity/my-activity${queryParams ? `?${queryParams}` : ''}`;
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Subscribe to real-time activity updates (WebSocket optional)
 * @param {function} callback - Function called when new activity arrives
 * @returns {function} Unsubscribe function
 */
export const subscribeToActivity = (callback) => {
  // TODO: Implement WebSocket connection for real-time updates
  // For now, this is a placeholder for polling or WebSocket implementation
  const pollInterval = setInterval(async () => {
    try {
      const activity = await getActivity({ limit: 1 });
      if (activity.length > 0) {
        callback(activity[0]);
      }
    } catch (error) {
      console.error('Failed to fetch activity update:', error);
    }
  }, 5000);
  
  return () => clearInterval(pollInterval);
};

/**
 * Get activity by type (bids, wins, listings, etc.)
 * @param {string} activityType - Type of activity to fetch
 * @param {object} options - Pagination options
 * @returns {Promise} Array of activity items
 */
export const getActivityByType = async (activityType, options = {}) => {
  return getActivity({ ...options, type: activityType });
};
