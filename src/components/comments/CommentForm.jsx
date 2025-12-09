// src/components/comments/CommentForm.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const CommentForm = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, rating);
      setContent('');
      setRating(5);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Form.Group controlId="commentRating" className="mb-3">
        <Form.Label>Your Rating</Form.Label>
        <div className="d-flex align-items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRatingChange(star)}
              style={{
                cursor: 'pointer',
                color: star <= rating ? '#ffd700' : '#e4e5e9',
                fontSize: '24px'
              }}
            >
              ★
            </span>
          ))}
          <span className="ms-2 text-muted">{rating} stars</span>
        </div>
      </Form.Group>
      
      <Form.Group controlId="commentContent" className="mb-3">
        <Form.Label>Your Review</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this product..."
          disabled={isLoading}
          required
          minLength="10"
          maxLength="1000"
        />
        <Form.Text className="text-muted">
          {content.length}/1000 characters (minimum 10 required)
        </Form.Text>
      </Form.Group>
      <Button variant="primary" type="submit" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post Comment'}
      </Button>
    </Form>
  );
};

export default CommentForm;