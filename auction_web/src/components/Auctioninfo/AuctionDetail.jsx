import { currency, formatTime } from '../../utils/format'
import './AuctionDetail.css'

export default function AuctionDetail({ auction, now, bidInput, bidError, onBidInputChange, onBidSubmit }) {
  return (
    <section className="detail">
      <div className={`detail__hero detail__hero--${auction.accent}`}>
        <span className="detail__tag">{auction.condition}</span>
        <div>
          <h2>{auction.title}</h2>
          <p>{auction.subtitle}</p>
        </div>
      </div>

      <div className="detail__body">
        <div className="detail__stats">
          <div>
            <span>Current bid</span>
            <strong>{currency.format(auction.currentBid)}</strong>
          </div>
          <div>
            <span>Increment</span>
            <strong>{currency.format(auction.increment)}</strong>
          </div>
          <div>
            <span>Bidders</span>
            <strong>{auction.bidders}</strong>
          </div>
        </div>

        <div className="detail__timer">
          <p className="label">Time remaining</p>
          <h3>{formatTime(auction.endAt, now)}</h3>
          <p className="muted">Location: {auction.location}</p>
        </div>

        <form className="bid" onSubmit={onBidSubmit}>
          <div className="bid__row">
            <label htmlFor="bid-input">Enter bid</label>
            <input
              id="bid-input"
              type="number"
              inputMode="numeric"
              min={auction.currentBid + auction.increment}
              placeholder={currency.format(auction.currentBid + auction.increment)}
              value={bidInput}
              onChange={onBidInputChange}
            />
          </div>
          {bidError ? <p className="error">{bidError}</p> : null}
          <button className="button button--primary" type="submit">
            Place bid
          </button>
        </form>

        <div className="detail__reserve">
          <div>
            <span>Reserve price</span>
            <strong>{currency.format(auction.reserve)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>
              {auction.currentBid >= auction.reserve ? 'Reserve met' : 'Reserve not met'}
            </strong>
          </div>
        </div>

        <div className="detail__notes">
          <h4>Lot notes</h4>
          <ul>
            <li>Includes verification and escrow support.</li>
            <li>Shipping estimate calculated at checkout.</li>
            <li>Returns accepted within 7 days of delivery.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
