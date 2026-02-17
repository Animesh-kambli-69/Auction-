import { currency } from '../utils/format'
import './Hero.css'

export default function Hero({ stats, now }) {
  return (
    <section className="hero">
      <div>
        <p className="hero__eyebrow">Live showcase</p>
        <h1>Bid on rare pieces. Track the pulse in real time.</h1>
        <p className="hero__lead">
          Today's room blends vintage optics, iconic modern furniture, and collector timepieces. All bids refresh live.
        </p>
        <div className="hero__actions">
          <button className="button button--primary">Start a watchlist</button>
          <button className="button button--ghost">View buyer guide</button>
        </div>
      </div>
      <div className="hero__panel">
        <div className="hero__panel-card">
          <p className="label">Pulse of the room</p>
          <h3>{currency.format(stats.totalValue)}</h3>
          <div className="sparkline">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="muted">Updated {new Date(now).toLocaleTimeString()}</p>
        </div>
        <div className="hero__panel-card">
          <p className="label">VIP preview</p>
          <h4>Midnight drop</h4>
          <p className="muted">Members get 30 min early access to tomorrow's watches.</p>
          <button className="button button--secondary">Request invite</button>
        </div>
      </div>
    </section>
  )
}
