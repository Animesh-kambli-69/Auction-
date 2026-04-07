// Backend WebSocket Configuration
// Handles real-time communication for bids, auctions, and activities

import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { isOriginAllowed } from './cors.js';

// Store connected clients by socket ID for tracking
const connectedClients = new Map();

const resolveHandshakeToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken;
  }

  const authHeader = socket.handshake?.headers?.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const joinUserRoomFromToken = (socket, token) => {
  if (!token) return false;

  const decoded = verifyToken(token);
  if (!decoded?._id) return false;

  const nextUserId = decoded._id.toString();
  const previousUserId = socket.data.userId;

  if (previousUserId && previousUserId !== nextUserId) {
    socket.leave(`user_${previousUserId}`);
  }

  socket.data.userId = nextUserId;
  socket.join(`user_${nextUserId}`);
  return true;
};

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Socket CORS blocked origin: ${origin || 'unknown'}`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Handle client connections
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    connectedClients.set(socket.id, socket);

    const handshakeToken = resolveHandshakeToken(socket);
    if (joinUserRoomFromToken(socket, handshakeToken)) {
      console.log(`🔐 Authenticated socket user: ${socket.data.userId}`);
    }

    socket.on('authenticate', (token) => {
      const authenticated = joinUserRoomFromToken(socket, token);
      socket.emit('authenticated', {
        success: authenticated,
        userId: socket.data.userId || null,
      });
    });

    // Join auction-specific room for targeted updates
    socket.on('subscribe_auction', (auctionId) => {
      socket.join(`auction_${auctionId}`);
      console.log(`👁️  User subscribed to auction: ${auctionId}`);
    });

    // Leave auction room
    socket.on('unsubscribe_auction', (auctionId) => {
      socket.leave(`auction_${auctionId}`);
      console.log(`👁️  User unsubscribed from auction: ${auctionId}`);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });

    socket.on('error', (error) => {
      console.error(`⚠️  Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

// Broadcast a new bid to all users watching that auction
export const emitBidPlaced = (io, auctionId, bidData) => {
  if (!io) return;
  io.to(`auction_${auctionId}`).emit('bid_placed', {
    auctionId,
    ...bidData,
    timestamp: new Date().toISOString(),
  });
  console.log(`💰 Bid emitted for auction ${auctionId}:`, bidData);
};

// Emit outbid notification to a specific user
export const emitOutbidNotification = (io, userId, payload) => {
  if (!io || !userId) return;
  io.to(`user_${userId}`).emit('outbid_notification', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
  console.log(`🔔 Outbid notification emitted to user ${userId}`);
};

// Emit listing moderation updates to a specific seller
export const emitListingStatusUpdate = (io, userId, payload) => {
  if (!io || !userId) return;
  io.to(`user_${userId}`).emit('listing_status_updated', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
  console.log(`📬 Listing status update emitted to user ${userId}`);
};

// Broadcast auction ended event
export const emitAuctionEnded = (io, auctionId, winner) => {
  if (!io) return;
  io.to(`auction_${auctionId}`).emit('auction_ended', {
    auctionId,
    winner,
    timestamp: new Date().toISOString(),
  });
  console.log(`🏁 Auction ended: ${auctionId}`);
};

// Broadcast new activity to all users
export const emitActivityCreated = (io, activityData) => {
  if (!io) return;
  io.emit('activity_created', {
    ...activityData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📢 Activity emitted:`, activityData);
};

// Get client count (useful for monitoring)
export const getConnectedClientsCount = () => connectedClients.size;
