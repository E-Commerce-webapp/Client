import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { 
    cart, 
    cartTotal, 
    cartCount, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="py-5">
          <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
          <h2 className="mt-3">Your cart is empty</h2>
          <p className="text-muted">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="btn btn-primary mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Your Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h2>
            <button 
              onClick={clearCart}
              className="btn btn-outline-danger btn-sm"
            >
              Clear Cart
            </button>
          </div>
          
          <div className="card mb-4">
            <div className="card-body p-0">
              {cart.map(item => (
                console.log(item),
                <div key={item.id} className="row g-0 border-bottom p-3 align-items-center">
                  <div className="col-md-2">
                    <img 
                      src={item.images} 
                      alt={item.title} 
                      className="img-fluid rounded"
                      style={{ maxHeight: '80px', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="col-md-4 ps-3">
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="text-muted small mb-0">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="col-md-3">
                    <div className="input-group input-group-sm" style={{ maxWidth: '120px' }}>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="form-control text-center" 
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value);
                          if (!isNaN(newQty) && newQty >= 1) {
                            updateQuantity(item.id, newQty);
                          }
                        }}
                        min="1"
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <div className="fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="col-md-1 text-end">
                    <button 
                      className="btn btn-link text-danger p-0"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="d-flex justify-content-between mb-4">
            <Link to="/" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>Continue Shopping
            </Link>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>
                <strong>${cartTotal.toFixed(2)}</strong>
              </div>
              <button className="btn btn-primary w-100 py-2">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}