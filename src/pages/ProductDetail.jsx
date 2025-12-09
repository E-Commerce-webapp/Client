import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getCommentsByProduct, createComment } from '../services/commentService';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';

export default function ProductDetail({ products }) {
  const { productId } = useParams();
  const product = products.find(p => p.id === productId); 
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  // Fetch comments for the current product
  useEffect(() => {
    const fetchComments = async () => {
      console.log('Fetching comments for product ID:', productId);
      try {
        const fetchedComments = await getCommentsByProduct(productId);
        console.log('Fetched comments:', fetchedComments);
        setComments(fetchedComments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchComments();
    }
  }, [productId]);

const handleAddComment = async (content, rating = 5) => {
  try {
    const newComment = await createComment(productId, content, rating);
    setComments(prev => [...prev, newComment]);
    return newComment;
  } catch (err) {
    console.error('Failed to add comment:', err);
    throw err;
  }
};

  if (!products || products.length === 0) {
    return <div className="container mt-4">Loading product...</div>;
  }

  if (!product) {
    return <div className="container mt-4">Product not found</div>;
  }

  const maxStock = product.stock;        
  const mainImage = product.images?.[0];  

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= maxStock) {
      addToCart(product, quantity);
      console.log(`Added ${quantity} of ${product} to cart.`);
      alert(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={mainImage} 
            alt={product.title} 
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-6">
          <h2>{product.title}</h2>
          {/* External products don’t have seller info, so just hide for now */}
          {/* <p className="text-muted">Sold by: something</p> */}
          <h4 className="my-3">${product.price.toFixed(2)}</h4>
          <p className="mb-4">{product.description}</p>
          
          <div className="mb-3">
            <label htmlFor="quantity" className="form-label">Quantity:</label>
            <div className="input-group mb-3" style={{ maxWidth: '150px' }}>
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                className="form-control text-center" 
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={maxStock}
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => setQuantity(prev => Math.min(maxStock, prev + 1))}
                disabled={quantity >= maxStock}
              >
                +
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-lg w-100 mb-3"
            onClick={handleAddToCart}
            disabled={maxStock === 0}
          >
            {maxStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          <div className="alert alert-info">
            <p className="mb-0">
              <i className="bi bi-check-circle me-2"></i>
              {maxStock > 0 
                ? `${maxStock} in stock` 
                : 'Currently out of stock'}
            </p>
          </div>

        </div>
      </div>
      
      {/* Comments Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="mb-4">Customer Reviews</h3>
          
          {/* Comment Form - Only show if user is logged in */}
          {currentUser ? (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Write a Review</h5>
                <CommentForm 
                  onSubmit={async (content, rating) => {
                    try {
                      await handleAddComment(content, rating);
                    } catch (error) {
                      console.error('Error submitting comment:', error);
                      // Handle error (e.g., show error message to user)
                    }
                  }} 
                  isLoading={false} 
                />
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              Please <a href="/login">sign in</a> to leave a review.
            </div>
          )}
          
          {/* Comments List */}
          <div className="mt-4">
            {loading ? (
              <div className="text-center my-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-warning">{error}</div>
            ) : comments && comments.length === 0 ? (
              <div className="alert alert-info">No reviews yet. Be the first to review!</div>
            ) : (
              <CommentList comments={comments} currentUser={currentUser} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
