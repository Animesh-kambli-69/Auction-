// Frontend WebSocket Service
// Handles real-time connection to backend and event listening

import io from 'socket.io-client';

let socket = null;

const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

// Initialize WebSocket connection
export const initializeSocket = () => {
  if (socket) return socket;

  const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: {
      token: getAuthToken(),
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('⚠️  WebSocket connection error:', error);
  });

  return socket;
};

// Update socket auth when login state changes
export const syncSocketAuth = () => {
  if (!socket) return;

  socket.auth = {
    ...(socket.auth || {}),
    token: getAuthToken(),
  };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Subscribe to a specific auction for live updates
export const subscribeToAuction = (auctionId) => {
  if (!auctionId) return;
  const sock = getSocket();
  sock.emit('subscribe_auction', auctionId);
  console.log(`👁️  Subscribed to auction: ${auctionId}`);
};

// Unsubscribe from an auction
export const unsubscribeFromAuction = (auctionId) => {
  if (!auctionId) return;
  const sock = getSocket();
  sock.emit('unsubscribe_auction', auctionId);
  console.log(`👁️  Unsubscribed from auction: ${auctionId}`);
};

// Listen for bid placed events
export const onBidPlaced = (callback) => {
  const sock = getSocket();
  const listener = (data) => {
    console.log('💰 Received bid update:', data);
    callback(data);
  };

  sock.on('bid_placed', listener);
  return () => sock.off('bid_placed', listener);
};

// Listen for auction ended events
export const onAuctionEnded = (callback) => {
  const sock = getSocket();
  const listener = (data) => {
    console.log('🏁 Auction ended:', data);
    callback(data);
  };

  sock.on('auction_ended', listener);
  return () => sock.off('auction_ended', listener);
};

// Listen for activity created events
export const onActivityCreated = (callback) => {
  const sock = getSocket();
  const listener = (data) => {
    console.log('📢 Activity received:', data);
    callback(data);
  };

  sock.on('activity_created', listener);
  return () => sock.off('activity_created', listener);
};

// Listen for personal outbid notification events
export const onOutbidNotification = (callback) => {
  const sock = getSocket();
  const listener = (data) => {
    console.log('🔔 Outbid notification:', data);
    callback(data);
  };

  sock.on('outbid_notification', listener);
  return () => sock.off('outbid_notification', listener);
};

// Disconnect from server
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  subscribeToAuction,
  unsubscribeFromAuction,
  syncSocketAuth,
  onBidPlaced,
  onAuctionEnded,
  onActivityCreated,
  onOutbidNotification,
  disconnectSocket,
};
