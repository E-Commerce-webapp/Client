import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaPrint, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaTruck, FaCheckCircle, FaHome, FaShoppingBag } from 'react-icons/fa';
import { getOrderById } from '../services/orderService';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getOrderById(orderId);
        
        if (response.data) {
          setOrder(response.data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date not available';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = () => {
    // In a real app, this would trigger an email with the invoice
    alert('This would send an email with the order details in a real application.');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Order</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-1" /> Back to Orders
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              <FaHome className="me-1" /> Back to Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <h4>Order Not Found</h4>
          <p>We couldn't find an order with ID: {orderId}</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="outline-warning" onClick={() => navigate('/orders')}>
              <FaShoppingBag className="me-1" /> View All Orders
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-1" /> Go Back
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              <FaHome className="me-1" /> Back to Home
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-1" /> Back to Orders
        </Button>
        <div className="d-print-none">
          <Button variant="outline-secondary" className="me-2" onClick={handlePrint}>
            <FaPrint className="me-1" /> Print
          </Button>
          <Button variant="outline-primary" onClick={handleEmailInvoice}>
            <FaEnvelope className="me-1" /> Email Invoice
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">Order #{order.id}</h4>
            <small className="text-muted">Placed on {formatDate(order.createdAt)}</small>
          </div>
          <Badge bg={getStatusVariant(order.status)} className="fs-6 p-2">
            {order.status}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          {/* Order Summary */}
          <Row className="mb-4">
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <h6 className="mb-0">Shipping Address</h6>
                </Card.Header>
                <Card.Body>
                  <address className="mb-0">
                    <strong>{order.shippingAddress.fullName}</strong><br />
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </address>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaCreditCard className="me-2" />
                  <h6 className="mb-0">Payment Method</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <FaCreditCard size={24} />
                    </div>
                    <div>
                      <div className="fw-bold">{order.paymentMethod}</div>
                      <div className="text-success">
                        <FaCheckCircle className="me-1" /> Paid
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaTruck className="me-2" />
                  <h6 className="mb-0">Order Summary</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>${order.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${order.taxAmount.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Order Items */}
          <h5 className="mb-3">Order Items</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={item.productImage} 
                          alt={item.productTitle}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div>
                          <div className="fw-bold">{item.productTitle}</div>
                          <small className="text-muted">ID: {item.productId}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">${item.price.toFixed(2)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                  <td className="text-end">${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Shipping:</td>
                  <td className="text-end">${order.shippingCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Tax:</td>
                  <td className="text-end">${order.taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td className="text-end fw-bold">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card.Body>
        
        <Card.Footer className="d-flex justify-content-between d-print-none">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-1" /> Back to Orders
          </Button>
          <div>
            <Button variant="outline-success" className="me-2">
              Track Order
            </Button>
            <Button variant="primary">
              Buy Again
            </Button>
          </div>
        </Card.Footer>
      </Card>
      
      <div className="d-print-none">
        <Card>
          <Card.Body>
            <h5>Need Help?</h5>
            <p className="mb-0">
              If you have any questions about your order, please contact our 
              <Link to="/contact" className="ms-1">customer support</Link>.
            </p>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default OrderDetail;
