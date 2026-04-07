// frontend/src/pages/auction/WatchlistPage.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { watchlistAPI } from '../../services/api'
import AuctionCard from '../../components/auction/AuctionCard'
import './WatchlistPage.css'

const WatchlistPage = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [watchlistItems, setWatchlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadWatchlist()
  }, [isLoggedIn])

  const loadWatchlist = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await watchlistAPI.getWatchlist({ limit: 100 })
      setWatchlistItems(response.data.watchlistItems)
    } catch (err) {
      setError('Failed to load your watchlist')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (auctionId) => {
    try {
      await watchlistAPI.removeFromWatchlist(auctionId)
      setWatchlistItems(watchlistItems.filter(item => item.auction._id !== auctionId))
    } catch (err) {
      alert('Failed to remove from watchlist')
    }
  }

  const getTimeRemaining = (endDate) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now

    if (diff < 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return 'Ending soon'
  }

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h1>My Watchlist</h1>
        <p className="subtitle">Items you're interested in</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading your watchlist...</div>
      ) : watchlistItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <h2>Your watchlist is empty</h2>
          <p>Start adding auctions to track items you love</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Browse Auctions
          </button>
        </div>
      ) : (
        <>
          <div className="watchlist-stats">
            <p className="stat"><strong>{watchlistItems.length}</strong> items in watchlist</p>
          </div>

          <div className="watchlist-table">
            <div className="table-header">
              <div className="col-item">Item</div>
              <div className="col-price">Current Bid</div>
              <div className="col-bids">Bids</div>
              <div className="col-time">Time Left</div>
              <div className="col-action">Action</div>
            </div>

            <div className="table-body">
              {watchlistItems.map(item => (
                <div key={item._id} className="table-row">
                  <div className="col-item">
                    <div className="item-content">
                      {item.auction.images?.[0]?.url && (
                        <img src={item.auction.images[0].url} alt={item.auction.title} className="item-image" />
                      )}
                      <div className="item-info">
                        <h3 className="item-title">{item.auction.title}</h3>
                        <p className="item-seller">By {item.auction.seller?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-price">${item.auction.currentBid.toFixed(2)}</div>
                  <div className="col-bids">{item.auction.bidCount}</div>
                  <div className="col-time">{getTimeRemaining(item.auction.endDate)}</div>
                  <div className="col-action">
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/auction/${item.auction._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(item.auction._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WatchlistPage
