import { useState, useEffect } from 'react';
import { getReviewsByProduct, getAverageRating, deleteReview } from '../api/reviews';

export default function ReviewList({ productId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUserId = localStorage.getItem('userId');

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getReviewsByProduct(productId),
        getAverageRating(productId)
      ]);
      setReviews(reviewsData);
      setAverageRating(ratingData);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, refreshTrigger]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await deleteReview(reviewId);
      fetchReviews();
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? '#ffc107' : '#e4e5e9',
            fontSize: '1rem'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Customer Reviews</h4>
        {averageRating && averageRating.totalReviews > 0 && (
          <div className="d-flex align-items-center">
            <span className="me-2">{renderStars(Math.round(averageRating.averageRating))}</span>
            <span className="text-muted">
              {averageRating.averageRating.toFixed(1)} out of 5 ({averageRating.totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-muted text-center py-4">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    <p className="card-text">{review.reviewText}</p>
                    <small className="text-muted">
                      {formatDate(review.createdAt)}
                    </small>
                  </div>
                  {currentUserId === review.userId && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
