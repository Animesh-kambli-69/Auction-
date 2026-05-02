import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('auctionhub_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Auth
export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerUser = async (name, email, password, confirmPassword) => {
  const { data } = await api.post('/auth/register', { name, email, password, confirmPassword });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.put(`/auth/reset-password/${token}`, { password });
  return data;
};

// Auctions
export const fetchAuctions = async (params = { status: 'active' }) => {
  const { data } = await api.get('/auctions', { params });
  return data.auctions || data;
};

export const getAuctionById = async (id) => {
  const { data } = await api.get(`/auctions/${id}`);
  return data.auction || data;
};

export const createAuction = async (auctionData) => {
  const { data } = await api.post('/auctions', auctionData);
  return data;
};

export const processPayment = async (auctionId, paymentData) => {
  const { data } = await api.post(`/auctions/${auctionId}/pay`, paymentData);
  return data;
};

// Bids
export const placeBid = async (auctionId, bidAmount) => {
  const { data } = await api.post('/bids', { auctionId, bidAmount });
  return data;
};

export const getMinimumBid = async (auctionId) => {
  const { data } = await api.get(`/auctions/${auctionId}/minimum-bid`);
  return data;
};

export const getBidHistory = async (auctionId, params = {}) => {
  const { data } = await api.get(`/bids/auction/${auctionId}`, { params });
  return data.bids || data;
};

// Admin Endpoints
export const fetchPendingAuctions = async () => {
  const { data } = await api.get('/admin/auctions/pending');
  return data.auctions || data;
};

export const approveAuction = async (auctionId, notes = '') => {
  const { data } = await api.post(`/admin/auctions/${auctionId}/approve`, { notes });
  return data;
};

export const rejectAuction = async (auctionId, reason) => {
  const { data } = await api.post(`/admin/auctions/${auctionId}/reject`, { reason });
  return data;
};

// User Endpoints
export const fetchMyBids = async () => {
  const { data } = await api.get('/bids/my-bids');
  return data;
};

export const fetchWonAuctions = async () => {
  const { data } = await api.get('/bids/won-auctions');
  return data.auctions || data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data.user || data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData);
  return data.user || data;
};

export const fetchMyAuctions = async () => {
  const { data } = await api.get('/auctions/my-auctions');
  return data.auctions || data;
};

export const fetchSiteReviews = async (params = {}) => {
  const { data } = await api.get('/site-reviews', { params });
  return data.reviews || data;
};

export const createSiteReview = async (reviewData) => {
  const { data } = await api.post('/site-reviews', reviewData);
  return data;
};

// Trust & Safety Endpoints
export const submitReport = async (reportData) => {
  const { data } = await api.post('/trust/report', reportData);
  return data;
};

export const openDispute = async (disputeData) => {
  const { data } = await api.post('/trust/dispute', disputeData);
  return data;
};

export const respondToDispute = async (id, response) => {
  const { data } = await api.put(`/trust/dispute/${id}/respond`, { response });
  return data;
};

export const fetchMyDisputes = async () => {
  const { data } = await api.get('/trust/dispute/my-disputes');
  return data.disputes || data;
};

export const getDisputeById = async (id) => {
  const { data } = await api.get(`/trust/dispute/${id}`);
  return data.dispute || data;
};

export const addDisputeMessage = async (id, message, attachmentUrl = null) => {
  const { data } = await api.post(`/trust/dispute/${id}/message`, { message, attachmentUrl });
  return data.dispute || data;
};

export const fetchAllUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.users || data;
};

export const fetchAdminReports = async () => {
  const { data } = await api.get('/trust/admin/reports');
  return data.reports || data;
};

export const fetchAdminDisputes = async () => {
  const { data } = await api.get('/trust/admin/disputes');
  return data.disputes || data;
};

export default api;
