import { currency, formatTime } from '../../utils/format'
import './AuctionCard.css'

export default function AuctionCard({ auction, now, isActive, onClick, onViewDetail }) {
  const timeLeft = formatTime(auction.endAt, now)
  const reserveMet = auction.currentBid >= auction.reserve
  const ended = auction.endAt <= now

  const handleViewDetails = (e) => {
    e.stopPropagation()
    if (onViewDetail) {
      onViewDetail()
    }
  }

  return (
    <div className={`auction-card-wrapper ${isActive ? 'is-active' : ''}`}>
      <button
        className={`auction-card card--${auction.accent}`}
        onClick={onClick}
      >
      <div className="auction-card__image">
        <span className="pill">{auction.category}</span>
        <span className={`status ${ended ? 'status--ended' : 'status--live'}`}>
          {ended ? 'Ended' : timeLeft}
        </span>
      </div>
      <div className="auction-card__body">
        <h3>{auction.title}</h3>
        <p>{auction.subtitle}</p>
        <div className="auction-card__meta">
          <div>
            <span>Current bid</span>
            <strong>{currency.format(auction.currentBid)}</strong>
          </div>
          <div>
            <span>Reserve</span>
            <strong>{reserveMet ? 'Met' : 'Not met'}</strong>
          </div>
        </div>
      </div>
    </button>
    {onViewDetail && (
      <button className="view-details-btn" onClick={handleViewDetails}>
        View Full Details
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    )}
  </div>
  )
}
