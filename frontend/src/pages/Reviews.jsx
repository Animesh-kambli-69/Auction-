import React, { useState, useEffect } from 'react';
import { fetchSiteReviews, createSiteReview } from '../api';
import { useAuth } from '../contexts/AuthContext';
import './Reviews.css';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const loadReviews = async () => {
    try {
      const data = await fetchSiteReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to submit a review.");
      return;
    }
    if (!comment.trim()) {
      alert("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      await createSiteReview({ rating, comment });
      setComment('');
      setRating(5);
      loadReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Reviews...</div>;

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <h2>Platform Reviews</h2>
        <p>See what our users think about AuctionHub.</p>
      </header>

      <div className="reviews-content">
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to leave one!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.reviewer?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="reviewer-name">{review.reviewer?.name || 'Anonymous'}</span>
                  </div>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>

        {isAuthenticated && (
          <div className="review-form-container">
            <h3>Leave a Review</h3>
            <form className="review-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rating</label>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows="4"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
