// Custom hook for real-time updates
// Listens to WebSocket events and provides callbacks for bid and activity updates

import { useEffect } from 'react';
import {
  initializeSocket,
  onBidPlaced,
  onActivityCreated,
  onAuctionEnded,
  onOutbidNotification,
  subscribeToAuction,
  unsubscribeFromAuction,
} from '../services/socket';

export const useRealtimeUpdates = ({
  onBid = null,
  onActivity = null,
  onAuctionEnd = null,
  onOutbid = null,
  auctionId = null,
}) => {
  useEffect(() => {
    initializeSocket();

    // Subscribe to auction if provided
    if (auctionId) {
      subscribeToAuction(auctionId);
    }

    // Setup event listeners
    const unsubscribeBid = onBid ? onBidPlaced(onBid) : null;
    const unsubscribeActivity = onActivity ? onActivityCreated(onActivity) : null;
    const unsubscribeAuctionEnd = onAuctionEnd ? onAuctionEnded(onAuctionEnd) : null;
    const unsubscribeOutbid = onOutbid ? onOutbidNotification(onOutbid) : null;

    // Cleanup on unmount
    return () => {
      if (auctionId) {
        unsubscribeFromAuction(auctionId);
      }
      if (unsubscribeBid) unsubscribeBid();
      if (unsubscribeActivity) unsubscribeActivity();
      if (unsubscribeAuctionEnd) unsubscribeAuctionEnd();
      if (unsubscribeOutbid) unsubscribeOutbid();
    };
  }, [auctionId, onBid, onActivity, onAuctionEnd, onOutbid]);
};

export default useRealtimeUpdates;
