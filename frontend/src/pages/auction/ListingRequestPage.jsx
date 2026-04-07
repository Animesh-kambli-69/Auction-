import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../components/common/Navigation'
import { getMyListingRequests, submitAuctionRequest } from '../../api/auctions'
import './ListingRequestPage.css'

const defaultForm = {
  title: '',
  subtitle: '',
  description: '',
  category: 'Electronics',
  condition: 'Good',
  startingPrice: '',
  reservePrice: '',
  increment: '25',
  location: '',
  endDate: '',
}

const readableStatus = {
  pending_approval: 'Pending approval',
  active: 'Approved and live',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  ended: 'Ended',
  approved: 'Approved',
}

export default function ListingRequestPage({ onBack, onRequireLogin }) {
  const { isLoggedIn } = useAuth()
  const [form, setForm] = useState(defaultForm)
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === 'pending_approval').length,
    [requests],
  )

  const fetchRequests = async () => {
    if (!isLoggedIn) return

    try {
      setLoadingRequests(true)
      const response = await getMyListingRequests({ limit: 20 })
      setRequests(response.listings || [])
    } catch (requestError) {
      setError(requestError.message || 'Failed to load your listing requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [isLoggedIn])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isLoggedIn) {
      onRequireLogin()
      return
    }

    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      await submitAuctionRequest({
        ...form,
        startingPrice: Number(form.startingPrice),
        reservePrice: form.reservePrice ? Number(form.reservePrice) : null,
        increment: Number(form.increment),
        endDate: form.endDate,
      })

      setForm(defaultForm)
      setMessage('Listing request submitted. Superadmin will review it shortly.')
      await fetchRequests()
    } catch (requestError) {
      setError(requestError.message || 'Failed to submit listing request')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="listing-request-page">
        <section className="listing-panel">
          <h2>Login required</h2>
          <p>You need to login before submitting an auction listing request.</p>
          <div className="listing-actions">
            <button type="button" className="btn btn-primary" onClick={onRequireLogin}>Login</button>
            <button type="button" className="btn" onClick={onBack}>Back</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="listing-request-page">
      <section className="listing-panel">
        <header className="listing-header">
          <button type="button" className="btn" onClick={onBack}>Back to home</button>
          <div>
            <h1>Submit Auction Request</h1>
            <p>Your item will be reviewed by a superadmin before it goes live.</p>
          </div>
        </header>

        {error ? <p className="notice notice-error">{error}</p> : null}
        {message ? <p className="notice">{message}</p> : null}

        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleInputChange} required minLength={5} maxLength={150} />
          </div>

          <div className="field">
            <label htmlFor="subtitle">Subtitle</label>
            <input id="subtitle" name="subtitle" value={form.subtitle} onChange={handleInputChange} maxLength={200} />
          </div>

          <div className="field field-full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleInputChange}
              required
              minLength={10}
              maxLength={2000}
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleInputChange}>
              <option>Electronics</option>
              <option>Gaming</option>
              <option>Furniture</option>
              <option>Audio</option>
              <option>Watches</option>
              <option>Antiques</option>
              <option>Art</option>
              <option>Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="condition">Condition</label>
            <select id="condition" name="condition" value={form.condition} onChange={handleInputChange}>
              <option>Mint</option>
              <option>Excellent</option>
              <option>Very Good</option>
              <option>Good</option>
              <option>Fair</option>
              <option>For Parts</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="startingPrice">Starting price</label>
            <input id="startingPrice" name="startingPrice" type="number" min="0" step="0.01" value={form.startingPrice} onChange={handleInputChange} required />
          </div>

          <div className="field">
            <label htmlFor="reservePrice">Reserve price</label>
            <input id="reservePrice" name="reservePrice" type="number" min="0" step="0.01" value={form.reservePrice} onChange={handleInputChange} />
          </div>

          <div className="field">
            <label htmlFor="increment">Increment</label>
            <input id="increment" name="increment" type="number" min="1" step="1" value={form.increment} onChange={handleInputChange} required />
          </div>

          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleInputChange} />
          </div>

          <div className="field field-full">
            <label htmlFor="endDate">Auction end date</label>
            <input id="endDate" name="endDate" type="datetime-local" value={form.endDate} onChange={handleInputChange} required />
          </div>

          <div className="listing-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </section>

      <section className="listing-panel request-history">
        <h2>My Listing Requests</h2>
        <p>Pending: {pendingCount}</p>

        {loadingRequests ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>No listing requests yet.</p>
        ) : (
          <div className="request-list">
            {requests.map((request) => (
              <article key={request._id} className="request-item">
                <div>
                  <h3>{request.title}</h3>
                  <p>{request.category} · {new Date(request.createdAt).toLocaleString()}</p>
                  {request.rejectionReason ? <p className="reject-reason">Reason: {request.rejectionReason}</p> : null}
                </div>
                <span className={`status status-${request.status}`}>{readableStatus[request.status] || request.status}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
