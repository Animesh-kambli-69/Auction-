// src/app.js - Express Application Setup

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/logging.js';
import { errorMiddleware } from './utils/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

const app = express();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ==================== BODY PARSING MIDDLEWARE ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== LOGGING MIDDLEWARE ====================
app.use(requestLogger);

// ==================== HEALTH CHECK ROUTE ====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ==================== API ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/activity', activityRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use(errorMiddleware);

export default app;
