// frontend/src/components/ReviewModal.jsx

import React, { useState } from 'react'
import { reviewAPI } from '../services/api'
import RatingStars from './common/RatingStars'
import './ReviewModal.css'

const ReviewModal = ({ auction, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await reviewAPI.createReview({
        auctionId: auction._id,
        rating,
        comment,
      })

      if (onSubmit) {
        onSubmit()
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2>Review Auction</h2>
        <p className="modal-subtitle">Share your experience with "{auction.title}"</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Rating</label>
            <div style={{ marginTop: '10px' }}>
              <RatingStars
                rating={rating}
                onRatingChange={setRating}
                readOnly={false}
                size="lg"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this auction..."
              maxLength={500}
              rows={5}
            />
            <small className="char-count">{comment.length}/500</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
