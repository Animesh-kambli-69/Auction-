// server.js - Server Startup Entry Point

import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import { initializeSocket } from './src/config/socket.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// ==================== SERVER STARTUP ====================
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectDB();

    // Configure Cloudinary
    console.log('🖼️  Configuring Cloudinary...');
    configureCloudinary();

    // Start HTTP and WebSocket servers
    const httpServer = createServer(app);
    const io = initializeSocket(httpServer);
    app.locals.io = io;

    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 AuctionHub Server Started 🚀     ║
╠════════════════════════════════════════╣
║  Port:       ${PORT}                     ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  API URL:    http://localhost:${PORT}  ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📍 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📍 Shutting down gracefully...');
  process.exit(0);
});

startServer();
