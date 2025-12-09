// src/components/comments/CommentForm.jsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const CommentForm = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Form.Group controlId="commentContent">
        <Form.Label>Add a comment</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this product..."
          disabled={isLoading}
        />
      </Form.Group>
      <Button variant="primary" type="submit" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post Comment'}
      </Button>
    </Form>
  );
};

export default CommentForm;