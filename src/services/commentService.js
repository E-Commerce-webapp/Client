// src/services/commentService.js
import api from '../utils/api';

// Mock data for testing
const mockComments = [
  {
    id: 1,
    content: 'This is a test comment',
    userId: 'user1',
    userName: 'Test User',
    createdAt: new Date().toISOString(),
    productId: 1
  },
  {
    id: 2,
    content: 'Another test comment',
    userId: 'user2',
    userName: 'Another User',
    createdAt: new Date().toISOString(),
    productId: 1
  }
];

export const getCommentsByProduct = async (productId) => {
  try {
    const response = await api.get(`/api/comments/product/${productId}`);
    // If the response has a 'comments' property, return that, otherwise return the response as is
    return response.data.comments || response.data || [];
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn('Comments not found for product:', productId);
      return [];
    } else {
      console.warn('Could not fetch comments from server, using mock data:', error.message);
      // Return mock data for the requested product
      return mockComments.filter(comment => comment.productId === parseInt(productId));
    }
  }
};

export const createComment = async (productId, content, rating = 5) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // Decode the token to get user info
    const user = JSON.parse(atob(token.split('.')[1]));
    if (!user || !user.sub) {
      throw new Error('Invalid token format');
    }
    
    const response = await api.post('/api/comments', { 
      productId,
      content,
      rating,
      userId: user.sub, // sub is typically the user ID in JWT
      userFullName: user.name || user.sub // Use name if available, otherwise fallback to sub
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    await api.delete(`/api/comments/${commentId}`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};