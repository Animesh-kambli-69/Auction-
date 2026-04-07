import { useState, useEffect } from 'react'
import { useAuth } from '../../store/AuthContext'
import { adminAPI } from '../../services/api'
import '../admin/AdminDashboard.css'

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingAuctions, setPendingAuctions] = useState([])
  const [stats, setStats] = useState({
    activeCount: 0,
    totalBids: 0,
    totalUsers: 0,
    pendingCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [approvalForm, setApprovalForm] = useState({
    scheduledLiveTime: '',
    notes: '',
  })
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'pending') {
        const res = await adminAPI.getPendingAuctions({ limit: 50 })
        setPendingAuctions(res.data.auctions || [])
      } else if (activeTab === 'stats') {
        const res = await adminAPI.getStats()
        setStats(res.data || {})
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      setMessage('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedAuction || !approvalForm.scheduledLiveTime) {
      setMessage('Please select a scheduled time')
      return
    }

    try {
      await adminAPI.approveAuction(selectedAuction._id, {
        scheduledLiveTime: approvalForm.scheduledLiveTime,
        notes: approvalForm.notes,
      })

      setMessage('Auction approved successfully!')
      setSelectedAuction(null)
      setApprovalForm({ scheduledLiveTime: '', notes: '' })
      setTimeout(() => setMessage(''), 3000)
      fetchData()
    } catch (error) {
      setMessage('Failed to approve auction')
      console.error('Error:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedAuction || !rejectReason.trim()) {
      setMessage('Please provide a rejection reason')
      return
    }

    try {
      await adminAPI.rejectAuction(selectedAuction._id, {
        rejectionReason: rejectReason,
      })

      setMessage('Auction rejected successfully!')
      setSelectedAuction(null)
      setShowRejectModal(false)
      setRejectReason('')
      setTimeout(() => setMessage(''), 3000)
      fetchData()
    } catch (error) {
      setMessage('Failed to reject auction')
      console.error('Error:', error)
    }
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingAuctions.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>

        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage('')} className="close-msg">×</button>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="pending-section">
            {loading ? (
              <div className="loading">Loading auctions...</div>
            ) : pendingAuctions.length === 0 ? (
              <div className="empty-state">
                <p>No pending auctions</p>
              </div>
            ) : (
              <div className="auctions-list">
                {pendingAuctions.map(auction => (
                  <div key={auction._id} className="auction-item">
                    <div className="auction-details">
                      <h3>{auction.title}</h3>
                      <p className="seller-info">
                        Seller: <strong>{auction.seller?.name}</strong> ({auction.seller?.email})
                      </p>
                      <p className="description">{auction.description.substring(0, 150)}...</p>
                      <div className="meta">
                        <span>Category: {auction.category}</span>
                        <span>Starting: ${auction.startingPrice?.toFixed(2) || '0.00'}</span>
                        <span>Reserve: ${auction.reservePrice?.toFixed(2) || 'None'}</span>
                        <span>Submitted: {new Date(auction.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="auction-actions">
                      <button
                        className="approve-btn"
                        onClick={() => {
                          setSelectedAuction(auction)
                          setApprovalForm({
                            scheduledLiveTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                            notes: '',
                          })
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => {
                          setSelectedAuction(auction)
                          setShowRejectModal(true)
                          setRejectReason('')
                        }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.activeCount || 0}</div>
              <div className="stat-label">Active Auctions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalBids || 0}</div>
              <div className="stat-label">Total Bids</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card pending">
              <div className="stat-value">{stats.pendingCount || 0}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {selectedAuction && !showRejectModal && (
          <div className="modal-overlay" onClick={() => setSelectedAuction(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Approve Auction: {selectedAuction.title}</h2>

              <div className="auction-preview">
                <p><strong>Title:</strong> {selectedAuction.title}</p>
                <p><strong>Seller:</strong> {selectedAuction.seller?.name}</p>
                <p><strong>Description:</strong> {selectedAuction.description}</p>
                <p><strong>Category:</strong> {selectedAuction.category}</p>
                <p><strong>Starting Price:</strong> ${selectedAuction.startingPrice?.toFixed(2) || '0.00'}</p>
                <p><strong>Reserve Price:</strong> ${selectedAuction.reservePrice?.toFixed(2) || 'None'}</p>
              </div>

              <div className="form-group">
                <label>Schedule Live Time *</label>
                <input
                  type="datetime-local"
                  value={approvalForm.scheduledLiveTime}
                  onChange={(e) => setApprovalForm(prev => ({
                    ...prev,
                    scheduledLiveTime: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Approval Notes</label>
                <textarea
                  value={approvalForm.notes}
                  onChange={(e) => setApprovalForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Optional notes for the seller"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button className="approve-btn" onClick={handleApprove}>
                  ✓ Approve
                </button>
                <button className="cancel-btn" onClick={() => setSelectedAuction(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {selectedAuction && showRejectModal && (
          <div className="modal-overlay" onClick={() => {
            setShowRejectModal(false)
            setSelectedAuction(null)
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Reject Auction: {selectedAuction.title}</h2>

              <div className="auction-preview">
                <p><strong>Title:</strong> {selectedAuction.title}</p>
                <p><strong>Seller:</strong> {selectedAuction.seller?.name}</p>
              </div>

              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows="4"
                  maxLength={500}
                />
                <small>{rejectReason.length}/500</small>
              </div>

              <div className="modal-actions">
                <button
                  className="reject-btn"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                >
                  ✕ Reject Auction
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedAuction(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
