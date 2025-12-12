import { useState } from 'react';
import { createReview } from '../api/reviews';

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      setError('Please write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview(productId, rating, reviewText);
      setRating(0);
      setReviewText('');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="star-rating"
          style={{
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: i <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9',
            transition: 'color 0.2s'
          }}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">Write a Review</h5>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Your Rating</label>
            <div>{renderStars()}</div>
          </div>

          <div className="mb-3">
            <label htmlFor="reviewText" className="form-label">Your Review</label>
            <textarea
              id="reviewText"
              className="form-control"
              rows="4"
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
