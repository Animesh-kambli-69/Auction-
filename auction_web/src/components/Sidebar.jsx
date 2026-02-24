import { currency } from '../utils/format'
import ActivityFeed from './Auctioninfo/ActivityFeed'
import './Sidebar.css'

export default function Sidebar({ auctions, stats, activity }) {
  const topLot = auctions.reduce(
    (top, auction) => (auction.currentBid > top.currentBid ? auction : top),
    auctions[0]
  )

  return (
    <aside className="sidebar">
      <div className="sidebar__card">
        <h3>Room highlights</h3>
        <div className="highlight">
          <div>
            <p className="label">Top lot</p>
            <h4>{topLot.title}</h4>
            <p className="muted">{currency.format(topLot.currentBid)}</p>
          </div>
          <button className="button button--ghost">Follow</button>
        </div>
        <div className="sidebar__stat">
          <span>Average bid</span>
          <strong>{currency.format(Math.round(stats.totalValue / auctions.length))}</strong>
        </div>
        <div className="sidebar__stat">
          <span>Watchers</span>
          <strong>312</strong>
        </div>
      </div>

      <div className="sidebar__card">
        <h3>Activity feed</h3>
        <ActivityFeed activity={activity} />
      </div>
    </aside>
  )
}
