import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

export default function ProductDetail({ products }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const { addToCart } = useCart();

  const isLoggedIn = !!localStorage.getItem('token');

  const handleReviewSubmitted = () => {
    setReviewRefresh(prev => prev + 1);
  };

  useEffect(() => {
    const loadProduct = async () => {
      // 1) Try external products first
      const fromExternal = products.find(
        (p) => String(p.id) === String(productId)
      );
      if (fromExternal) {
        setProduct(fromExternal);
        setLoading(false);
        return;
      }

      // 2) Fallback: fetch single internal product by id
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching internal product by id:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, products]);

  if (loading) {
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
          <p className="text-muted mb-2">
            Store:{' '}
            {product.storeName && product.storeId ? (
              <span
                className="text-primary"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/store/${product.storeId}`)}
              >
                {product.storeName}
              </span>
            ) : (
              <span className="text-secondary">Unknown</span>
            )}
          </p>
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

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <hr className="mb-4" />
          
          {/* Review Form - only show if logged in */}
          {isLoggedIn ? (
            <ReviewForm 
              productId={productId} 
              onReviewSubmitted={handleReviewSubmitted} 
            />
          ) : (
            <div className="alert alert-secondary mb-4">
              <a href="/login" className="alert-link">Log in</a> to write a review.
            </div>
          )}

          {/* Reviews List */}
          <ReviewList 
            productId={productId} 
            refreshTrigger={reviewRefresh} 
          />
        </div>
      </div>
    </div>
  );
}
