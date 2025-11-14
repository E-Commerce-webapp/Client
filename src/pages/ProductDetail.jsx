import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import products from "../mock/products.json";
import users from "../mock/users.json";

export default function ProductDetail() {
  const { productId } = useParams();
  const product = products.find(p => p.product_id === parseInt(productId));
  const seller = users.find(user => user.user_id === product?.seller_id);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) {
    return <div className="container mt-4">Product not found</div>;
  }

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.stock_quantity) {
      addToCart(product, quantity);
      alert(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock_quantity) {
      setQuantity(value);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={product.image} 
            alt={product.name} 
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">Sold by: {seller?.username || 'Unknown Seller'}</p>
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
                max={product.stock_quantity}
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => setQuantity(prev => Math.min(product.stock_quantity, prev + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                +
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-lg w-100 mb-3"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          <div className="alert alert-info">
            <p className="mb-0">
              <i className="bi bi-check-circle me-2"></i>
              {product.stock_quantity > 0 
                ? `${product.stock_quantity} in stock` 
                : 'Currently out of stock'}
            </p>
          </div>
          
          <p className="text-muted small mt-3">
            <i className="bi bi-calendar me-1"></i>
            Listed on: {new Date(product.date_added).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}