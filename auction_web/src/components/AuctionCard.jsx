import { currency, formatTime } from '../utils/format'
import './AuctionCard.css'

export default function AuctionCard({ auction, now, isActive, onClick }) {
  const timeLeft = formatTime(auction.endAt, now)
  const reserveMet = auction.currentBid >= auction.reserve
  const ended = auction.endAt <= now

  return (
    <button
      className={`auction-card card--${auction.accent} ${isActive ? 'is-active' : ''}`}
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
  )
}
