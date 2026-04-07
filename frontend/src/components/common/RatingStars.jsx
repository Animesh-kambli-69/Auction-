// frontend/src/components/common/RatingStars.jsx

import React from 'react'
import './RatingStars.css'

const RatingStars = ({ rating, onRatingChange, readOnly = true, size = 'md' }) => {
  const [hoverRating, setHoverRating] = React.useState(0)

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  const sizeClass = {
    sm: 'rating-sm',
    md: 'rating-md',
    lg: 'rating-lg',
  }[size]

  return (
    <div className={`rating-stars ${sizeClass} ${readOnly ? 'readonly' : 'interactive'}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : 'empty'}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          role={readOnly ? 'img' : 'button'}
          aria-label={`${star} stars`}
        >
          ★
        </span>
      ))}
      {rating > 0 && <span className="rating-text">({rating.toFixed(1)})</span>}
    </div>
  )
}

export default RatingStars
