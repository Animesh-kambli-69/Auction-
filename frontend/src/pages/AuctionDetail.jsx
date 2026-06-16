import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuctionById, placeBid, getBidHistory, submitReport } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import './AuctionDetail.css';

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [now, setNow] = useState(Date.now());
  
  // Report Listing State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('fake_item');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Anti-Snipe Extension Notice
  const [extensionNotice, setExtensionNotice] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set SEO Meta Tags when auction loads
  useEffect(() => {
    if (auction) {
      document.title = `${auction.title} | AuctionHub`;
      
      const setMetaTag = (attrName, attrValue, content) => {
        let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attrName, attrValue);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      const description = `Bid on ${auction.title} starting at $${auction.startingPrice}. ${auction.description.substring(0, 100)}...`;

      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:title', `${auction.title} | AuctionHub`);
      setMetaTag('property', 'og:description', description);
      setMetaTag('property', 'og:type', 'website');
      setMetaTag('property', 'og:url', window.location.href);
      if (auction.images?.[0]?.url) {
        setMetaTag('property', 'og:image', auction.images[0].url);
      }
    }
  }, [auction]);

  // Socket.io for Real-time Bid Updates
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('bid_placed', (data) => {
      // If the bid is for this exact auction, update UI live
      if (auction && String(auction._id) === String(data.auctionId || id)) {
        setAuction(prev => ({
          ...prev,
          currentBid: data.currentBid,
          bidCount: data.bidCount,
          endDate: data.endDate,
          currentBidder: data.bidder
        }));
        
        // Show Anti-Snipe bump if extended
        if (data.wasExtended) {
          setExtensionNotice(true);
          setTimeout(() => setExtensionNotice(false), 5000); // Hide after 5s
        }
      }
    });

    return () => socket.disconnect();
  }, [auction, id]);

  const loadAuction = async () => {
    try {
      const data = await getAuctionById(id);
      setAuction(data);
      setBidAmount(data.currentBid ? data.currentBid + (data.increment || 10) : data.startingPrice);
      
      // If admin, load bid history
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        const bidData = await getBidHistory(id);
        setBids(bidData);
      }
    } catch (err) {
      setError('Auction not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuction();
  }, [id, user]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to place a bid.");
      return navigate('/login');
    }
    
    try {
      await placeBid(id, Number(bidAmount));
      alert("Bid placed successfully!");
      loadAuction(); // Reload to get new currentBid
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid.');
    }
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  const isHighestBidder = () => {
    return user && auction?.currentBidder && 
      String(auction.currentBidder._id || auction.currentBidder) === String(user._id);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    
    setReportSubmitting(true);
    try {
      await submitReport({
        reportedAuction: id,
        reportedUser: auction.seller?._id || auction.seller,
        reason: reportReason,
        description: reportDescription
      });
      alert('Report submitted successfully. Our team will review it.');
      setShowReportModal(false);
      setReportDescription('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Auction Details...</div>;
  if (error || !auction) return <div className="error-screen">{error}</div>;

  return (
    <div className="auction-detail-page">
      <div className="detail-visual" style={{ backgroundImage: `url(${auction.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1200'})` }}>
        <button className="back-btn" onClick={() => navigate('/home')}>← Back to Auctions</button>
      </div>

      <div className="detail-content">
        <div className="detail-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="category-badge">{auction.category}</span>
            <button 
              onClick={() => isAuthenticated ? setShowReportModal(true) : navigate('/login')}
              style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🚩 Report Listing
            </button>
          </div>
          <h1>{auction.title}</h1>
          <p className="description">{auction.description}</p>
          
          {/* Report Modal Overlay */}
          {showReportModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#ef4444' }}>Report Suspicious Listing</h3>
                <form onSubmit={handleReportSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Reason</label>
                    <select 
                      value={reportReason} 
                      onChange={e => setReportReason(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    >
                      <option value="fake_item">Fake or Counterfeit Item</option>
                      <option value="prohibited_item">Prohibited Item</option>
                      <option value="scam">Suspected Scam</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Additional Details</label>
                    <textarea 
                      value={reportDescription}
                      onChange={e => setReportDescription(e.target.value)}
                      required
                      rows={4}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', resize: 'vertical' }}
                      placeholder="Please provide details about why you are reporting this listing..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowReportModal(false)} style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={reportSubmitting} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{reportSubmitting ? 'Submitting...' : 'Submit Report'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {isAdmin && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <h3>Admin View: Previous Bidders</h3>
              {bids.length === 0 ? (
                <p>No bids yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                  {bids.map(b => (
                    <li key={b._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                      <span>{b.bidder?.name || 'Unknown'}</span>
                      <strong style={{ color: 'var(--color-primary)' }}>${b.amount}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="bid-panel">
            <div className="current-price">
              <span className="label">Current Bid</span>
              <h2>${(auction.currentBid || auction.startingPrice).toLocaleString()}</h2>
            </div>
            
            <div className="auction-meta">
              <p><strong>Condition:</strong> {auction.condition || 'Good'}</p>
              <p><strong>Minimum Increment:</strong> ${auction.increment || 10}</p>
              <p><strong>Start Date:</strong> {new Date(auction.createdAt || auction.startDate).toLocaleString()}</p>
              <p><strong>End Date:</strong> {new Date(auction.endDate).toLocaleString()}</p>
              
              {extensionNotice && (
                <div style={{ marginTop: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
                  ⏳ Late bid placed — Time extended by 2 mins!
                </div>
              )}
            </div>

            {isAdmin ? (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', textAlign: 'center' }}>
                Admins cannot bid on auctions.
              </div>
            ) : new Date(auction.endDate).getTime() <= now || auction.status === 'ended' ? (
              user && auction.winner && String(auction.winner._id || auction.winner) === String(user._id) ? (
                <div className="winner-panel" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid #fbbf24', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(251, 191, 36, 0.1)' }}>
                  <h3 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1.5rem' }}>🎉 You won!</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Please complete your payment.</p>
                  {auction.payment?.status === 'paid' ? (
                    <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', fontWeight: 'bold' }}>
                      ✓ Payment Completed
                    </div>
                  ) : (
                    <button onClick={() => navigate(`/checkout/${auction._id}`)} style={{ width: '100%', padding: '1rem', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.target.style.transform = 'scale(1.02)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
                      Proceed to Checkout
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
                  This auction has ended. {auction.winner && 'Winner: ' + (auction.winner.name || 'Anonymous')}
                </div>
              )
            ) : isHighestBidder() ? (
              <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', textAlign: 'center' }}>
                You're the highest bidder!
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} className="bid-form">
                <input 
                  type="number" 
                  value={bidAmount} 
                  onChange={e => setBidAmount(e.target.value)}
                  min={(auction.currentBid || auction.startingPrice) + (auction.increment || 10)}
                  required
                />
                <button type="submit" className="place-bid-btn">Place Bid</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
