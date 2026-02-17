import AuctionCard from './AuctionCard'
import './AuctionList.css'

export default function AuctionList({ auctions, now, selectedId, onSelectAuction }) {
  return (
    <section className="auction-list">
      <div className="section-title">
        <h2>Active auctions</h2>
        <p>{auctions.length} lots in today's room</p>
      </div>

      <div className="auction-grid">
        {auctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={auction}
            now={now}
            isActive={auction.id === selectedId}
            onClick={() => onSelectAuction(auction.id)}
          />
        ))}
      </div>
    </section>
  )
}
