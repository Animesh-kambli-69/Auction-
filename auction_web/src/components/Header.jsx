import './Header.css'

export default function Header({ stats, totalBids }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark">A</span>
        <div>
          <p className="brand__name">Auction Atlas</p>
          <p className="brand__tag">Curated design and gear, live every hour.</p>
        </div>
      </div>
      <div className="topbar__meta">
        <div className="meta-card">
          <p>Live now</p>
          <h4>{stats.activeCount}</h4>
        </div>
        <div className="meta-card">
          <p>Total bids</p>
          <h4>{totalBids}</h4>
        </div>
        <div className="meta-card">
          <p>Ending soon</p>
          <h4>{stats.endingSoon}</h4>
        </div>
      </div>
    </header>
  )
}
