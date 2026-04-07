import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../components/common/Navigation'
import {
  approveAuctionRequest,
  getPendingAuctionRequests,
  getSuperAdminStats,
  rejectAuctionRequest,
} from '../../api/admin'
import './SuperAdminDashboard.css'

export default function SuperAdminDashboard({ onBack, onRequireLogin }) {
  const { isLoggedIn, currentUser } = useAuth()
  const [pendingRequests, setPendingRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState('')
  const [notesById, setNotesById] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isSuperAdmin = useMemo(
    () => currentUser?.role === 'admin' || currentUser?.role === 'superadmin',
    [currentUser?.role],
  )

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [pendingResponse, statsResponse] = await Promise.all([
        getPendingAuctionRequests({ limit: 50 }),
        getSuperAdminStats(),
      ])

      setPendingRequests(pendingResponse.auctions || [])
      setStats(statsResponse.stats || null)
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Failed to load superadmin dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn && isSuperAdmin) {
      loadDashboard()
    }
  }, [isLoggedIn, isSuperAdmin])

  const handleApprove = async (auctionId) => {
    try {
      setProcessingId(auctionId)
      await approveAuctionRequest(auctionId, notesById[auctionId] || '')
      setMessage('Auction approved and now listed live.')
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message || 'Failed to approve request')
    } finally {
      setProcessingId('')
    }
  }

  const handleReject = async (auctionId) => {
    const reason = (notesById[auctionId] || '').trim()

    if (!reason) {
      setError('Please provide a rejection reason before rejecting a request.')
      return
    }

    try {
      setProcessingId(auctionId)
      await rejectAuctionRequest(auctionId, reason)
      setMessage('Auction request rejected.')
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message || 'Failed to reject request')
    } finally {
      setProcessingId('')
    }
  }

  const handleNotesChange = (auctionId, value) => {
    setNotesById((previousNotes) => ({
      ...previousNotes,
      [auctionId]: value,
    }))
  }

  if (!isLoggedIn) {
    return (
      <main className="superadmin-page">
        <section className="superadmin-panel">
          <h2>Login required</h2>
          <p>Only superadmin accounts can review auction listing requests.</p>
          <div className="panel-actions">
            <button type="button" className="action-btn primary" onClick={onRequireLogin}>Login</button>
            <button type="button" className="action-btn" onClick={onBack}>Back</button>
          </div>
        </section>
      </main>
    )
  }

  if (!isSuperAdmin) {
    return (
      <main className="superadmin-page">
        <section className="superadmin-panel">
          <h2>Access denied</h2>
          <p>This dashboard is available only for superadmin users.</p>
          <div className="panel-actions">
            <button type="button" className="action-btn" onClick={onBack}>Back</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="superadmin-page">
      <section className="superadmin-panel">
        <header className="superadmin-header">
          <button type="button" className="action-btn" onClick={onBack}>Back to home</button>
          <div>
            <h1>Superadmin Listing Dashboard</h1>
            <p>Review user listing requests and approve or reject each item.</p>
          </div>
        </header>

        {message ? <p className="flash-message">{message}</p> : null}
        {error ? <p className="flash-message flash-error">{error}</p> : null}

        <div className="stats-row">
          <article className="stat-card">
            <h3>Pending Requests</h3>
            <p>{stats?.pendingCount ?? pendingRequests.length}</p>
          </article>
          <article className="stat-card">
            <h3>Active Auctions</h3>
            <p>{stats?.activeCount ?? 0}</p>
          </article>
          <article className="stat-card">
            <h3>Total Users</h3>
            <p>{stats?.totalUsers ?? 0}</p>
          </article>
        </div>

        {loading ? (
          <p>Loading pending requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p>No pending requests. All caught up.</p>
        ) : (
          <div className="request-list">
            {pendingRequests.map((request) => (
              <article key={request._id} className="request-card">
                <div className="request-main">
                  <h2>{request.title}</h2>
                  <p>{request.description}</p>
                  <div className="request-meta">
                    <span>Seller: {request.seller?.name || 'Unknown'}</span>
                    <span>Category: {request.category}</span>
                    <span>Start: ${Number(request.startingPrice || 0).toFixed(2)}</span>
                    <span>Reserve: {request.reservePrice ? `$${Number(request.reservePrice).toFixed(2)}` : 'None'}</span>
                  </div>
                </div>

                <div className="request-actions">
                  <textarea
                    rows="3"
                    placeholder="Add approval note or rejection reason"
                    value={notesById[request._id] || ''}
                    onChange={(event) => handleNotesChange(request._id, event.target.value)}
                  />

                  <div className="action-row">
                    <button
                      type="button"
                      className="action-btn primary"
                      onClick={() => handleApprove(request._id)}
                      disabled={processingId === request._id}
                    >
                      {processingId === request._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="action-btn danger"
                      onClick={() => handleReject(request._id)}
                      disabled={processingId === request._id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
