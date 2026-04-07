import { currency, formatTime } from '../../utils/format';
import './AuctionDetailPage.css';

const AuctionDetailPage = ({ auction, now, onBack, onBid, isLoggedIn, onLoginRequired }) => {
  const timeLeft = formatTime(auction.endAt, now);
  const reserveMet = auction.currentBid >= auction.reserve;
  const ended = auction.endAt <= now;
  const timeRemaining = auction.endAt - now;
  const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const handleBidClick = () => {
    if (!isLoggedIn) {
      onLoginRequired();
    } else {
      onBid();
    }
  };

  return (
    <div className="auction-detail-page">
      <div className="detail-page-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Auctions
        </button>
      </div>

      <div className="detail-page-container">
        {/* Left Section - Main Content */}
        <div className="detail-page-main">
          {/* Hero Image Section */}
          <div className={`detail-page-hero detail-page-hero--${auction.accent}`}>
            <div className="detail-page-image-placeholder">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>{auction.title}</p>
            </div>
            <div className="detail-page-badges">
              <span className="badge badge-category">{auction.category}</span>
              <span className={`badge badge-status ${ended ? 'ended' : 'live'}`}>
                {ended ? 'Ended' : 'Live'}
              </span>
              <span className="badge badge-condition">{auction.condition}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="detail-page-title">
            <h1>{auction.title}</h1>
            <p className="subtitle">{auction.subtitle}</p>
          </div>

          {/* Item Details */}
          <div className="detail-section">
            <h3>Item Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{auction.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Condition</span>
                <span className="detail-value">{auction.condition}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{auction.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Reserve Status</span>
                <span className={`detail-value ${reserveMet ? 'success' : 'warning'}`}>
                  {reserveMet ? '✓ Met' : '✗ Not Met'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h3>Description</h3>
            <p className="description-text">
              This is a premium item in {auction.condition.toLowerCase()} condition. 
              Located in {auction.location}, this {auction.category.toLowerCase()} item 
              is currently available for bidding. The auction includes verification and 
              escrow support for secure transactions.
            </p>
          </div>

          {/* Lot Notes */}
          <div className="detail-section">
            <h3>Lot Notes</h3>
            <ul className="lot-notes">
              <li>Includes verification and escrow support for secure transactions</li>
              <li>Shipping estimate calculated at checkout based on location</li>
              <li>Returns accepted within 7 days of delivery with full refund</li>
              <li>Buyer protection included on all purchases</li>
              <li>Professional inspection available upon request</li>
            </ul>
          </div>

          {/* Bid History */}
          <div className="detail-section">
            <h3>Bid History</h3>
            <div className="bid-history">
              <div className="bid-history-item">
                <div className="bid-history-info">
                  <span className="bidder-name">Bidder #{auction.bidders}</span>
                  <span className="bid-time">Current high bid</span>
                </div>
                <span className="bid-amount">{currency.format(auction.currentBid)}</span>
              </div>
              <div className="bid-stats">
                <div className="stat">
                  <span className="stat-label">Total Bids</span>
                  <span className="stat-value">{auction.bids}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Unique Bidders</span>
                  <span className="stat-value">{auction.bidders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Bidding Panel */}
        <div className="detail-page-sidebar">
          <div className="bidding-panel">
            {/* Timer */}
            <div className="bidding-timer">
              <h4>Time Remaining</h4>
              {!ended ? (
                <div className="timer-display">
                  {daysLeft > 0 && (
                    <div className="timer-segment">
                      <span className="timer-value">{daysLeft}</span>
                      <span className="timer-label">days</span>
                    </div>
                  )}
                  <div className="timer-segment">
                    <span className="timer-value">{hoursLeft}</span>
                    <span className="timer-label">hours</span>
                  </div>
                  <div className="timer-segment">
                    <span className="timer-value">{minutesLeft}</span>
                    <span className="timer-label">mins</span>
                  </div>
                </div>
              ) : (
                <p className="auction-ended">Auction Ended</p>
              )}
            </div>

            {/* Current Bid Info */}
            <div className="bid-info-panel">
              <div className="bid-info-item">
                <span className="info-label">Current Bid</span>
                <span className="info-value current-bid">{currency.format(auction.currentBid)}</span>
              </div>
              <div className="bid-info-row">
                <div className="bid-info-item small">
                  <span className="info-label">Increment</span>
                  <span className="info-value">{currency.format(auction.increment)}</span>
                </div>
                <div className="bid-info-item small">
                  <span className="info-label">Reserve</span>
                  <span className="info-value">{currency.format(auction.reserve)}</span>
                </div>
              </div>
            </div>

            {/* Bid Button */}
            {!ended && (
              <div className="bid-action">
                <button 
                  className="bid-now-button" 
                  onClick={handleBidClick}
                >
                  {isLoggedIn ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      Place Your Bid
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Login to Bid
                    </>
                  )}
                </button>
                <p className="minimum-bid">
                  Minimum bid: {currency.format(auction.currentBid + auction.increment)}
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Secure Bidding
              </div>
              <div className="trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified Item
              </div>
              <div className="trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
