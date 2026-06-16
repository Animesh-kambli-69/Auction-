import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyBids, fetchMyAuctions, fetchWonAuctions, openDispute, fetchMyDisputes } from '../api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [myDisputes, setMyDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'seller' ? 'seller' : 'buyer');

  // Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedDisputeAuction, setSelectedDisputeAuction] = useState(null);
  const [disputeReason, setDisputeReason] = useState('not_as_described');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bidsData, auctionsData, wonData, disputesData] = await Promise.all([
          fetchMyBids(),
          fetchMyAuctions(),
          fetchWonAuctions(),
          fetchMyDisputes()
        ]);
        setBids(bidsData.bids || []);
        setAuctions(auctionsData);
        setWonAuctions(wonData);
        setMyDisputes(disputesData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="loading-screen">Loading your dashboard...</div>;

  // Process data for Buyer Dashboard
  const winningBids = bids.filter(bid => bid.isHighest && new Date(bid.auction?.endDate) > new Date());
  const outbidBids = bids.filter(bid => !bid.isHighest && new Date(bid.auction?.endDate) > new Date());

  // Process data for Seller Dashboard
  const activeListings = auctions.filter(a => a.status === 'active');
  const pendingListings = auctions.filter(a => a.status === 'pending_approval');
  const soldListings = auctions.filter(a => a.status === 'ended' && a.winner);
  
  const totalEarnings = soldListings.reduce((sum, a) => sum + (a.currentBid || 0), 0);
  const pendingPayments = soldListings.filter(a => a.payment?.status !== 'paid').reduce((sum, a) => sum + (a.currentBid || 0), 0);

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    setDisputeSubmitting(true);
    try {
      await openDispute({
        auctionId: selectedDisputeAuction._id,
        reason: disputeReason,
        description: disputeDescription
      });
      alert('Dispute opened successfully. The seller has been notified.');
      setShowDisputeModal(false);
      setDisputeDescription('');
      setSelectedDisputeAuction(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open dispute.');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Welcome back, {user.name}</h2>
        <p>Manage your bids, listings, and account settings.</p>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'buyer' ? 'active' : ''}`}
            onClick={() => setActiveTab('buyer')}
          >
            Buyer Dashboard
          </button>
          {user.role === 'seller' && (
            <button 
              className={`tab-btn ${activeTab === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveTab('seller')}
            >
              Seller Dashboard
            </button>
          )}
        </div>
      </header>

      {activeTab === 'buyer' ? (
        <div className="dashboard-content buyer-content">
          <div className="dashboard-stats-row">
            <div className="stat-card buyer-stat">
              <h3>{winningBids.length}</h3>
              <p>Auctions Winning</p>
            </div>
            <div className="stat-card buyer-stat warning">
              <h3>{outbidBids.length}</h3>
              <p>Auctions Outbid</p>
            </div>
            <div className="stat-card buyer-stat success">
              <h3>{wonAuctions.length}</h3>
              <p>Total Items Won</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card main-card">
              <h3>Purchases & Won Items</h3>
              {wonAuctions.length === 0 ? (
                <p className="empty-state">You haven't won any items yet.</p>
              ) : (
                <ul className="detailed-list">
                  {wonAuctions.map(auction => (
                    <li key={auction._id} className="detailed-item">
                      <div className="item-info">
                        <h4>{auction.title}</h4>
                        <p className="meta">Sold by {auction.seller?.name || 'Unknown'} for ${auction.currentBid?.toLocaleString()}</p>
                      </div>
                      <div className="item-actions">
                        {auction.payment?.status === 'paid' ? (
                          <>
                            <span className="badge-paid">Paid</span>
                            <button 
                              className="action-btn" 
                              style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                              onClick={() => {
                                setSelectedDisputeAuction(auction);
                                setShowDisputeModal(true);
                              }}
                            >
                              Open Dispute
                            </button>
                          </>
                        ) : (
                          <button className="action-btn pay-btn" onClick={() => navigate(`/checkout/${auction._id}`)}>
                            Pay Now
                          </button>
                        )}
                        <button className="action-btn view-btn" onClick={() => navigate(`/auction/${auction._id}`)}>
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Dispute Modal Overlay */}
            {showDisputeModal && selectedDisputeAuction && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#f59e0b' }}>Open Dispute for "{selectedDisputeAuction.title}"</h3>
                  <form onSubmit={handleDisputeSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Reason</label>
                      <select 
                        value={disputeReason} 
                        onChange={e => setDisputeReason(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                      >
                        <option value="item_not_received">Item Not Received</option>
                        <option value="not_as_described">Item Not As Described</option>
                        <option value="damaged">Damaged in Transit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Detailed Explanation</label>
                      <textarea 
                        value={disputeDescription}
                        onChange={e => setDisputeDescription(e.target.value)}
                        required
                        rows={4}
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', resize: 'vertical' }}
                        placeholder="Please explain the issue you are having with this purchase..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowDisputeModal(false)} style={{ background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" disabled={disputeSubmitting} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{disputeSubmitting ? 'Opening...' : 'Open Dispute'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="side-column">
              <section className="dashboard-card">
                <h3>Winning Bids</h3>
                {winningBids.length === 0 ? (
                  <p className="empty-state sm">No winning bids.</p>
                ) : (
                  <ul className="item-list">
                    {winningBids.map(bid => (
                      <li key={bid._id} className="list-item" onClick={() => navigate(`/auction/${bid.auction?._id}`)}>
                        <span className="truncate">{bid.auction?.title}</span>
                        <strong className="amount winning-text">${bid.amount}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dashboard-card">
                <h3>Needs Attention (Outbid)</h3>
                {outbidBids.length === 0 ? (
                  <p className="empty-state sm">No outbid items.</p>
                ) : (
                  <ul className="item-list">
                    {outbidBids.map(bid => (
                      <li key={bid._id} className="list-item outbid" onClick={() => navigate(`/auction/${bid.auction?._id}`)}>
                        <span className="truncate">{bid.auction?.title}</span>
                        <div className="outbid-action">
                          <strong className="amount">${bid.amount}</strong>
                          <span className="bid-again-link">Bid Again</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {myDisputes.length > 0 && (
                <section className="dashboard-card">
                  <h3>Active Disputes</h3>
                  <ul className="item-list">
                    {myDisputes.map(dispute => (
                      <li key={dispute._id} className="list-item" onClick={() => navigate(`/dispute/${dispute._id}`)}>
                        <span className="truncate" style={{ color: '#f59e0b' }}>⚠️ {dispute.auction?.title}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{dispute.status}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-content seller-content">
          <div className="dashboard-stats-row">
            <div className="stat-card seller-stat highlight">
              <h3>${totalEarnings.toLocaleString()}</h3>
              <p>Total Lifetime Earnings</p>
            </div>
            <div className="stat-card seller-stat">
              <h3>${pendingPayments.toLocaleString()}</h3>
              <p>Pending Payments</p>
            </div>
            <div className="stat-card seller-stat">
              <h3>{activeListings.length}</h3>
              <p>Active Listings</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card main-card">
              <div className="card-header-flex">
                <h3>My Active Listings</h3>
                <button className="action-btn primary" onClick={() => navigate('/create-listing')}>
                  + Create New
                </button>
              </div>
              
              {activeListings.length === 0 ? (
                <p className="empty-state">You don't have any active listings.</p>
              ) : (
                <ul className="detailed-list">
                  {activeListings.map(auction => (
                    <li key={auction._id} className="detailed-item" onClick={() => navigate(`/auction/${auction._id}`)}>
                      <div className="item-info">
                        <h4>{auction.title}</h4>
                        <div className="seller-meta">
                          <span>Current Bid: <strong>${auction.currentBid?.toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>{auction.bidCount} Bids</span>
                          <span>•</span>
                          <span>{auction.views} Views</span>
                        </div>
                      </div>
                      <span className="badge-active">Active</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="side-column">
              <section className="dashboard-card">
                <h3>Pending Approval</h3>
                {pendingListings.length === 0 ? (
                  <p className="empty-state sm">All listings approved.</p>
                ) : (
                  <ul className="item-list">
                    {pendingListings.map(auction => (
                      <li key={auction._id} className="list-item pending">
                        <span className="truncate">{auction.title}</span>
                        <span className="badge-pending">Pending</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dashboard-card">
                <h3>Recent Sales</h3>
                {soldListings.length === 0 ? (
                  <p className="empty-state sm">No recent sales.</p>
                ) : (
                  <ul className="item-list">
                    {soldListings.slice(0, 5).map(auction => (
                      <li key={auction._id} className="list-item" onClick={() => navigate(`/auction/${auction._id}`)}>
                        <span className="truncate">{auction.title}</span>
                        <strong className="amount success-text">+${auction.currentBid?.toLocaleString()}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {myDisputes.length > 0 && (
                <section className="dashboard-card">
                  <h3>Active Disputes</h3>
                  <ul className="item-list">
                    {myDisputes.map(dispute => (
                      <li key={dispute._id} className="list-item" onClick={() => navigate(`/dispute/${dispute._id}`)}>
                        <span className="truncate" style={{ color: '#f59e0b' }}>⚠️ {dispute.auction?.title}</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{dispute.status}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
