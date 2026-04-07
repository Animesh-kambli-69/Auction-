// API Service for frontend
// Handles all HTTP requests to the backend

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  register: (userData) =>
    api.post('/api/auth/register', userData),
  logout: () =>
    api.post('/api/auth/logout'),
  getCurrentUser: () =>
    api.get('/api/auth/me'),
};

// ==================== AUCTIONS ====================
export const auctionAPI = {
  // Get all auctions with filters
  getAllAuctions: (params = {}) =>
    api.get('/api/auctions', { params }),

  // Get single auction by ID
  getAuctionById: (auctionId) =>
    api.get(`/api/auctions/${auctionId}`),

  // Create new auction
  createAuction: (auctionData) =>
    api.post('/api/auctions', auctionData),

  // Update auction
  updateAuction: (auctionId, auctionData) =>
    api.patch(`/api/auctions/${auctionId}`, auctionData),

  // Edit draft auction
  editDraftAuction: (auctionId, auctionData) =>
    api.put(`/api/auctions/${auctionId}/draft`, auctionData),

  // Delete auction
  deleteAuction: (auctionId) =>
    api.delete(`/api/auctions/${auctionId}`),

  // Get user's auctions
  getMyAuctions: (params = {}) =>
    api.get('/api/auctions/user/my-auctions', { params }),

  // Submit auction for approval
  submitForApproval: (auctionId) =>
    api.post(`/api/auctions/${auctionId}/submit-approval`),

  // Search auctions
  searchAuctions: (query, params = {}) =>
    api.get('/api/auctions/search', { params: { q: query, ...params } }),

  // Upload images
  uploadImages: (auctionId, images) =>
    api.post(`/api/auctions/${auctionId}/upload-images`, { images }),

  // Remove image
  removeImage: (auctionId, imageId) =>
    api.delete(`/api/auctions/${auctionId}/images/${imageId}`),
};

// ==================== BIDS ====================
export const bidAPI = {
  // Place a bid
  placeBid: (auctionId, bidAmount) =>
    api.post('/api/bids', { auctionId, bidAmount }),

  // Get bid history for an auction
  getBidHistory: (auctionId, params = {}) =>
    api.get(`/api/bids/auction/${auctionId}`, { params }),

  // Get user's bids
  getMyBids: (params = {}) =>
    api.get('/api/bids/my-bids', { params }),

  // Get won auctions
  getWonAuctions: () =>
    api.get('/api/bids/won-auctions'),

  // Validate bid before placing
  validateBid: (auctionId, bidAmount) =>
    api.post('/api/bids/validate', { auctionId, bidAmount }),
};

// ==================== ACTIVITY ====================
export const activityAPI = {
  // Get all activities
  getAllActivities: (params = {}) =>
    api.get('/api/activity', { params }),

  // Get user's activities
  getMyActivities: (params = {}) =>
    api.get('/api/activity/my-activity', { params }),

  // Get activities for specific auction
  getAuctionActivities: (auctionId, params = {}) =>
    api.get(`/api/activity/auction/${auctionId}`, { params }),
};

// ==================== USERS ====================
export const userAPI = {
  // Get user profile
  getUserProfile: (userId) =>
    api.get(`/api/users/${userId}`),

  // Update user profile
  updateProfile: (userData) =>
    api.patch('/api/users/profile', userData),

  // Upload avatar
  uploadAvatar: (formData) =>
    api.post('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ==================== WATCHLIST ====================
export const watchlistAPI = {
  // Get user's watchlist
  getWatchlist: (params = {}) =>
    api.get('/api/watchlist', { params }),

  // Add to watchlist
  addToWatchlist: (auctionId) =>
    api.post('/api/watchlist/add', { auctionId }),

  // Remove from watchlist
  removeFromWatchlist: (auctionId) =>
    api.delete(`/api/watchlist/${auctionId}`),

  // Toggle watchlist
  toggleWatchlist: (auctionId) =>
    api.post('/api/watchlist/toggle', { auctionId }),

  // Check if watchlisted
  isWatchlisted: (auctionId) =>
    api.get(`/api/watchlist/${auctionId}/check`),
};

// ==================== REVIEWS ====================
export const reviewAPI = {
  // Create review
  createReview: (reviewData) =>
    api.post('/api/reviews', reviewData),

  // Get reviews for auction
  getAuctionReviews: (auctionId, params = {}) =>
    api.get(`/api/reviews/auction/${auctionId}`, { params }),

  // Get reviews for seller
  getSellerReviews: (sellerId, params = {}) =>
    api.get(`/api/reviews/seller/${sellerId}`, { params }),

  // Update review
  updateReview: (reviewId, reviewData) =>
    api.put(`/api/reviews/${reviewId}`, reviewData),

  // Delete review
  deleteReview: (reviewId) =>
    api.delete(`/api/reviews/${reviewId}`),
};

// ==================== ADMIN ====================
export const adminAPI = {
  // Get pending approvals
  getPendingAuctions: (params = {}) =>
    api.get('/api/admin/auctions/pending', { params }),

  // Get auctions by status
  getAuctionsByStatus: (status, params = {}) =>
    api.get('/api/admin/auctions/status', { params: { status, ...params } }),

  // Approve auction
  approveAuction: (auctionId, data) =>
    api.post(`/api/admin/auctions/${auctionId}/approve`, data),

  // Reject auction
  rejectAuction: (auctionId, data) =>
    api.post(`/api/admin/auctions/${auctionId}/reject`, data),

  // Get admin stats
  getStats: () =>
    api.get('/api/admin/stats'),

  // Get all users
  getAllUsers: (params = {}) =>
    api.get('/api/admin/users', { params }),

  // Get user activity
  getUserActivity: (userId, params = {}) =>
    api.get(`/api/admin/users/${userId}/activity`, { params }),
};

export default api;
