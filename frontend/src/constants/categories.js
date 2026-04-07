// src/constants/categories.js - Auction Categories

export const AUCTION_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '📋' },
  { id: 'Gaming', name: 'Gaming', icon: '🎮' },
  { id: 'Furniture', name: 'Furniture', icon: '🪑' },
  { id: 'Audio', name: 'Audio', icon: '🎧' },
  { id: 'Watches', name: 'Watches', icon: '⌚' },
  { id: 'Antiques', name: 'Antiques', icon: '🏺' },
  { id: 'Electronics', name: 'Electronics', icon: '💻' },
  { id: 'Art', name: 'Art', icon: '🎨' },
  { id: 'Other', name: 'Other', icon: '📦' },
];

export const CONDITIONS = [
  { id: 'Mint', label: 'Mint' },
  { id: 'Excellent', label: 'Excellent' },
  { id: 'Very Good', label: 'Very Good' },
  { id: 'Good', label: 'Good' },
  { id: 'Fair', label: 'Fair' },
  { id: 'For Parts', label: 'For Parts' },
];

export const AUCTION_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
};

export default AUCTION_CATEGORIES;
