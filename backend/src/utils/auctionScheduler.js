// src/utils/auctionScheduler.js - Auction Scheduler

import Auction from '../models/Auction.js';
import Activity from '../models/Activity.js';

let schedulerInterval = null;

export const initializeScheduler = (io) => {
  console.log('⏰ Initializing Auction Scheduler...');

  // Run immediately on startup
  checkAndActivateAuctions(io);

  // Then check every minute
  schedulerInterval = setInterval(() => {
    checkAndActivateAuctions(io);
  }, 60000); // 60 seconds

  console.log('✓ Scheduler initialized - checking every minute');
};

export const checkAndActivateAuctions = async (io) => {
  try {
    const now = new Date();

    // Find all 'approved' auctions where scheduledLiveTime <= now
    const auctionsToActivate = await Auction.find({
      status: 'approved',
      scheduledLiveTime: { $lte: now },
    }).populate('seller', 'name email');

    if (auctionsToActivate.length > 0) {
      console.log(`\n🎯 Found ${auctionsToActivate.length} auction(s) to activate`);

      for (const auction of auctionsToActivate) {
        // Update auction status to active
        auction.status = 'active';
        await auction.save();

        console.log(`✓ Auction "${auction.title}" is now LIVE (ID: ${auction._id})`);

        // Log activity
        try {
          await Activity.logActivity(
            'auction_went_live',
            auction.seller._id,
            auction._id,
            `Auction "${auction.title}" went live`,
            {
              scheduledTime: auction.scheduledLiveTime,
              activatedAt: now,
            }
          );
        } catch (activityError) {
          console.error('Error logging activity:', activityError.message);
        }

        // Emit WebSocket event to all connected clients
        if (io) {
          io.emit('auction_went_live', {
            auctionId: auction._id,
            title: auction.title,
            seller: auction.seller.name,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in auction scheduler:', error.message);
  }
};

export const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('📹 Scheduler stopped');
  }
};

// Graceful shutdown
process.on('SIGINT', stopScheduler);
process.on('SIGTERM', stopScheduler);
