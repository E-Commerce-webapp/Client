import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CartContext } from "../contexts/CartContext";
import { createOrder } from '../services/orderService';

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic form validation
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'country', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }
    
    try {
      // Calculate order total
      const orderTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '/images/placeholder.jpg'
        })),
        total: orderTotal,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        },
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country
        },
        payment: {
          method: formData.paymentMethod,
          status: 'Paid',
          transactionId: `TXN-${Date.now()}`
        },
        status: 'Processing',
        orderDate: new Date().toISOString()
      };
      
      console.log('Submitting order:', orderData);
      
      // Create the order
      const response = await createOrder(orderData);
      const orderId = response.data?.id;
      
      if (!orderId) {
        throw new Error('Failed to create order: No order ID returned');
      }
      
      console.log('Order created successfully:', orderId);
      
      // Clear cart and show success
      clearCart();
      setSuccess(`Order #${orderId} placed successfully!`);
      
      // Redirect to order confirmation after 2 seconds
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process your order. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    return (
      <Container className="py-5 text-center">
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart before checking out.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Checkout</h2>
      
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Shipping Information</h5>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        as="select"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FI">Finland</option>
                        <option value="JP">Japan</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                <h5 className="mb-4">Payment Method</h5>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    id="credit-card"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === 'credit-card'}
                    onChange={handleChange}
                    label="Credit Card"
                    className="mb-2"
                  />
                  
                  {formData.paymentMethod === 'credit-card' && (
                    <div className="ms-4">
                      <Form.Group className="mb-3">
                        <Form.Label>Card Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </Form.Group>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Expiration Date</Form.Label>
                            <Form.Control
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>CVC</Form.Label>
                            <Form.Control
                              type="text"
                              name="cardCvc"
                              value={formData.cardCvc}
                              onChange={handleChange}
                              placeholder="123"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  )}
                </Form.Group>

                <Form.Check
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={handleChange}
                  label="PayPal"
                  className="mb-3"
                />

                <Form.Check
                  type="radio"
                  id="bank-transfer"
                  name="paymentMethod"
                  value="bank-transfer"
                  checked={formData.paymentMethod === 'bank-transfer'}
                  onChange={handleChange}
                  label="Bank Transfer"
                  className="mb-4"
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : 'Place Order'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              
              <div className="mb-3">
                {cart.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2">
                    <div>
                      {item.name} × {item.quantity}
                    </div>
                    <div>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <div>Subtotal</div>
                <div>${calculateTotal()}</div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Shipping</div>
                <div>$0.00</div>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <div>Tax</div>
                <div>$0.00</div>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between fw-bold mb-3">
                <div>Total</div>
                <div>${calculateTotal()}</div>
              </div>
              
              <div className="small text-muted">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
