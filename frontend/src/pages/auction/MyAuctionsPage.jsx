// frontend/src/pages/auction/MyAuctionsPage.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { auctionAPI } from '../../services/api'
import AuctionCard from '../../components/auction/AuctionCard'
import './MyAuctionsPage.css'

const MyAuctionsPage = () => {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [auctions, setAuctions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadAuctions()
  }, [filter, isLoggedIn])

  const loadAuctions = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await auctionAPI.getMyAuctions(params)
      setAuctions(response.data.auctions)
    } catch (err) {
      setError('Failed to load your auctions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this draft auction?')) return

    try {
      await auctionAPI.deleteAuction(auctionId)
      setAuctions(auctions.filter(a => a._id !== auctionId))
    } catch (err) {
      alert('Failed to delete auction')
    }
  }

  const handleSubmit = async (auctionId) => {
    try {
      const response = await auctionAPI.submitForApproval(auctionId)
      const updated = auctions.map(a => a._id === auctionId ? response.data.auction : a)
      setAuctions(updated)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit for approval')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: '#999', label: 'Draft' },
      pending_approval: { color: '#ffc107', label: 'Pending Approval' },
      approved: { color: '#28a745', label: 'Approved' },
      active: { color: '#007bff', label: 'Active' },
      ended: { color: '#6c757d', label: 'Ended' },
      cancelled: { color: '#dc3545', label: 'Cancelled' },
    }
    return badges[status] || badges.draft
  }

  return (
    <div className="my-auctions-page">
      <div className="page-header">
        <h1>My Auctions</h1>
        <button className="create-btn" onClick={() => navigate('/create-auction')}>
          + Create New Auction
        </button>
      </div>

      <div className="filter-tabs">
        {['all', 'draft', 'pending_approval', 'active', 'ended'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading your auctions...</div>
      ) : auctions.length === 0 ? (
        <div className="empty-state">
          <p>No auctions found</p>
          <button onClick={() => navigate('/create-auction')} className="btn-primary">
            Create Your First Auction
          </button>
        </div>
      ) : (
        <div className="auctions-grid">
          {auctions.map(auction => (
            <div key={auction._id} className="auction-item-wrapper">
              <AuctionCard auction={auction} />
              <div className="auction-actions">
                <span className="status-badge" style={{ background: getStatusBadge(auction.status).color }}>
                  {getStatusBadge(auction.status).label}
                </span>
                {auction.status === 'draft' && (
                  <>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => navigate(`/edit-auction/${auction._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(auction._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="action-btn submit-btn"
                      onClick={() => handleSubmit(auction._id)}
                    >
                      Submit for Approval
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyAuctionsPage
