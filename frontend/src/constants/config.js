// src/constants/config.js - App Configuration

export const APP_CONFIG = {
  name: 'AuctionHub',
  version: '1.0.0',
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 10000,
  },
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: 'auctionhub',
  },
  pagination: {
    auctionsPerPage: 20,
    activityPerPage: 50,
    bidsPerPage: 10,
  },
  bid: {
    minimumIncrement: 1,
  },
  auction: {
    minTitleLength: 5,
    maxTitleLength: 150,
    minDescriptionLength: 10,
    maxDescriptionLength: 2000,
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export default APP_CONFIG;
