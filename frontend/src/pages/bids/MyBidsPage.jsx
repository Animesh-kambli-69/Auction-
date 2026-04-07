import { useEffect, useState } from 'react'
import { useAuth } from '../../store/AuthContext'
import { bidAPI } from '../../services/api'
import { currency, formatTime } from '../../utils/format'
import '../bids/MyBidsPage.css'

export default function MyBidsPage() {
  const { currentUser } = useAuth()
  const [bids, setBids] = useState([])
  const [wonAuctions, setWonAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true)
        const [bidsRes, wonRes] = await Promise.all([
          bidAPI.getMyBids(),
          bidAPI.getWonAuctions(),
        ])

        setBids(bidsRes.data.bids || [])
        setWonAuctions(wonRes.data.auctions || [])
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bids')
        console.error('Error fetching bids:', err)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchBids()
    }
  }, [currentUser])

  const getFilteredBids = () => {
    if (activeTab === 'won') return []
    if (activeTab === 'all') return bids
    return bids.filter(bid => {
      const auctionEnd = new Date(bid.auction?.endDate).getTime()
      return activeTab === 'active' ? auctionEnd > now : auctionEnd <= now && bid.status === 'outbid'
    })
  }

  const filteredBids = getFilteredBids()

  return (
    <div className="my-bids-page">
      <div className="bids-container">
        <h1>My Bids & Auctions</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Bids ({bids.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`tab-btn ${activeTab === 'outbid' ? 'active' : ''}`}
            onClick={() => setActiveTab('outbid')}
          >
            Outbid
          </button>
          <button
            className={`tab-btn ${activeTab === 'won' ? 'active' : ''}`}
            onClick={() => setActiveTab('won')}
          >
            Won ({wonAuctions.length})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading your bids...</div>
        ) : activeTab === 'won' ? (
          <div className="bids-list">
            {wonAuctions.length === 0 ? (
              <div className="empty-state">
                <p>You haven't won any auctions yet.</p>
              </div>
            ) : (
              wonAuctions.map(auction => (
                <div key={auction._id} className="bid-card won">
                  <div className="bid-info">
                    <h3>{auction.title}</h3>
                    <p className="auction-meta">
                      Winning bid: <strong>{currency(auction.currentBid)}</strong>
                    </p>
                    <p className="auction-meta">
                      Seller: <strong>{auction.seller?.name}</strong>
                    </p>
                  </div>
                  <div className="bid-status won-badge">Won!</div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bids-list">
            {filteredBids.length === 0 ? (
              <div className="empty-state">
                <p>No bids in this category.</p>
              </div>
            ) : (
              filteredBids.map(bid => {
                const auctionEnd = new Date(bid.auction?.endDate).getTime()
                const isActive = auctionEnd > now

                return (
                  <div key={bid._id} className={`bid-card ${bid.status}`}>
                    <div className="bid-info">
                      <h3>{bid.auction?.title}</h3>
                      <p className="bid-amount">
                        Your bid: <strong>{currency(bid.amount)}</strong>
                      </p>
                      <p className="auction-meta">
                        Current bid: {currency(bid.auction?.currentBid)}
                        {bid.isHighest && <span className="highest-badge">Highest</span>}
                      </p>
                      <p className="auction-meta">
                        Placed on: {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bid-status-section">
                      <div className={`bid-status ${bid.status}`}>
                        {bid.status === 'active'
                          ? 'Active'
                          : bid.status === 'outbid'
                          ? 'Outbid'
                          : 'Won'}
                      </div>
                      {isActive && (
                        <div className="time-left">
                          {formatTime(bid.auction?.endDate, now)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
