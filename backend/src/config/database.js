// src/config/database.js - MongoDB Connection Configuration

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auctionhub';
    
    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✓ MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB Disconnected');
  } catch (error) {
    console.error(`✗ MongoDB Disconnection Error: ${error.message}`);
  }
};
