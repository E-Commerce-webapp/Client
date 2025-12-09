import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { format } from 'date-fns';

const Comment = ({ comment, onDelete, currentUser }) => {
  const isOwner = currentUser && comment.userId === currentUser.id;

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <Card.Title>{comment.userName}</Card.Title>
          <Card.Subtitle className="text-muted">
            {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
          </Card.Subtitle>
        </div>
        <Card.Text>{comment.content}</Card.Text>
        {isOwner && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(comment.id)}
          >
            Delete
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default Comment;