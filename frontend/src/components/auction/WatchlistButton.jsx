// frontend/src/components/auction/WatchlistButton.jsx

import React, { useState, useEffect } from 'react'
import { useAuth } from '../common/Navigation'
import { watchlistAPI } from '../../services/api'
import './WatchlistButton.css'

const WatchlistButton = ({ auctionId, onToggle }) => {
  const { isLoggedIn } = useAuth()
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn && auctionId) {
      checkWatchlist()
    }
  }, [auctionId, isLoggedIn])

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.isWatchlisted(auctionId)
      setIsWatchlisted(response.data.isWatchlisted)
    } catch (error) {
      console.error('Failed to check watchlist status:', error)
    }
  }

  const handleToggle = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      const response = await watchlistAPI.toggleWatchlist(auctionId)
      setIsWatchlisted(response.data.isWatchlisted)
      if (onToggle) {
        onToggle(response.data.isWatchlisted)
      }
    } catch (error) {
      console.error('Failed to toggle watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`watchlist-button ${isWatchlisted ? 'watchlisted' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <span className="heart-icon">♥</span>
      <span className="watchlist-text">{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
    </button>
  )
}

export default WatchlistButton
