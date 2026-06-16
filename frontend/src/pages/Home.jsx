import React, { useState, useEffect } from 'react';
import { fetchAuctions, placeBid, getMinimumBid } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import './Home.css';

export default function Home() {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [liveBids, setLiveBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const [active, ended] = await Promise.all([
          fetchAuctions({ status: 'active' }),
          fetchAuctions({ status: 'ended' })
        ]);
        setActiveAuctions(active);
        setEndedAuctions(ended);
        setError(null);
      } catch (err) {
        setError('Failed to load auctions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAuctions();

    // Setup Live Ticker Socket
    const socket = io('http://localhost:5000');
    socket.on('bid_placed', (data) => {
      setLiveBids(prev => {
        const newBids = [{
          id: data.bidId || Date.now(),
          auctionTitle: data.auctionTitle,
          amount: data.bidAmount,
          bidderName: data.bidder?.name || 'Someone',
          time: new Date()
        }, ...prev];
        return newBids.slice(0, 5); // Keep last 5
      });
      
      // Update auction price in grid dynamically
      setActiveAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction._id === data.auctionId 
            ? { ...auction, currentBid: data.bidAmount, currentBidder: data.bidder }
            : auction
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const formatRemainingTime = (endDate) => {
    const ms = new Date(endDate).getTime() - now;
    if (ms <= 0) return 'Ended';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const isHighestBidder = (auction) => {
    if (!user || !auction.currentBidder) return false;
    const bidderId = auction.currentBidder._id || auction.currentBidder;
    return String(bidderId) === String(user._id);
  };

  const handleBid = async (auctionId, currentBid, auction) => {
    if (!isAuthenticated) {
      alert("Please login to place a bid.");
      return;
    }

    try {
      if (isHighestBidder(auction)) {
        alert("You are already the highest bidder. Wait for someone else to bid first.");
        return;
      }

      const minBidData = await getMinimumBid(auctionId);
      const bidAmount = minBidData.minimumBid || minBidData.currentBid + minBidData.increment;

      await placeBid(auctionId, bidAmount);
      // Refresh auctions after successful bid
      const data = await fetchAuctions();
      setAuctions(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid.');
    }
  };

  if (loading) return <div className="loading-screen">Loading Live Auctions...</div>;
  
  if (error) return <div className="error-screen" style={{ color: '#ef4444', textAlign: 'center', padding: '4rem' }}>{error}</div>;

  return (
    <div className="home-page">
      <header className="home-header">
        <h2>Live Auctions</h2>
        <p>Bid on exclusive items ending soon.</p>
      </header>

      {liveBids.length > 0 && (
        <div className="live-ticker">
          <div className="ticker-label">🔴 LIVE BIDS:</div>
          <div className="ticker-scroll">
            {liveBids.map(bid => (
              <span key={bid.id} className="ticker-item">
                <strong>{bid.bidderName}</strong> just bid <strong className="ticker-amount">${bid.amount.toLocaleString()}</strong> on <em>{bid.auctionTitle}</em>
              </span>
            ))}
          </div>
        </div>
      )}

      {activeAuctions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          No active auctions right now. Check back later!
        </div>
      ) : (
        <div className="auction-grid">
          {activeAuctions.map(auction => (
            <div key={auction._id} className="auction-card">
              <div 
                className="auction-image" 
                style={{ backgroundImage: `url(${auction.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'})`, cursor: 'pointer', position: 'relative' }}
                onClick={() => window.location.href = `/auction/${auction._id}`}
              >
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  ⏳ {formatRemainingTime(auction.endDate)}
                </div>
              </div>
              <div className="auction-details">
                <h3 style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/auction/${auction._id}`}>{auction.title}</h3>
                <div className="auction-footer">
                  <span className="current-bid">
                    <span className="bid-label">Current Bid</span>
                    ${(auction.currentBid || auction.startingPrice).toLocaleString()}
                  </span>
                  {isHighestBidder(auction) ? (
                    <button className="bid-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>You're winning</button>
                  ) : (
                    <button className="bid-btn" onClick={() => handleBid(auction._id, auction.currentBid || auction.startingPrice, auction)}>Quick Bid +$10</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {endedAuctions.length > 0 && (
        <>
          <header className="home-header" style={{ marginTop: '3rem' }}>
            <h2>Ended Auctions</h2>
            <p>Past items that have already found their winners.</p>
          </header>
          <div className="auction-grid" style={{ opacity: 0.7 }}>
            {endedAuctions.map(auction => (
              <div key={auction._id} className="auction-card">
                <div 
                  className="auction-image" 
                  style={{ backgroundImage: `url(${auction.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'})`, cursor: 'pointer' }}
                  onClick={() => window.location.href = `/auction/${auction._id}`}
                >
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(200,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Ended
                  </div>
                </div>
                <div className="auction-details">
                  <h3 style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/auction/${auction._id}`}>{auction.title}</h3>
                  <div className="auction-footer">
                    <span className="current-bid">
                      <span className="bid-label">Final Price</span>
                      ${(auction.currentBid || auction.startingPrice).toLocaleString()}
                    </span>
                    <button className="bid-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Ended</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
