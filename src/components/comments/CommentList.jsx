import React from 'react';
import Comment from './Comment';

const CommentList = ({ comments, onDelete, currentUser }) => {
  if (!comments || comments.length === 0) {
    return <p className="text-muted">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="mt-4">
      <h5>Comments ({comments.length})</h5>
      {comments.map(comment => (
        <Comment
          key={comment.id}
          comment={comment}
          onDelete={onDelete}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default CommentList;