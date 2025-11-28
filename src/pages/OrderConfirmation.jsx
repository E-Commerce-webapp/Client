import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <Container className="py-5 text-center">
      <Card className="border-0 shadow-sm p-4">
        <Card.Body className="py-5">
          <div className="text-success mb-4" style={{ fontSize: '4rem' }}>
            <FaCheckCircle />
          </div>
          <h2 className="mb-3">Thank You for Your Order!</h2>
          <p className="lead mb-4">
            Your order has been placed successfully.
          </p>
          
          <Card className="bg-light mb-4">
            <Card.Body>
              <p className="mb-2">Order Number:</p>
              <h4 className="text-primary">{orderId}</h4>
              <p className="text-muted mb-0">
                We've sent an order confirmation to your email.
              </p>
            </Card.Body>
          </Card>
          
          <p className="text-muted mb-4">
            Your items will be processed and shipped within 2-3 business days.
            You will receive a shipping confirmation email with tracking information
            once your order is on its way.
          </p>
          
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-2"
              onClick={() => navigate('/')}
            >
              <FaHome /> Continue Shopping
            </Button>
            <Button
              variant="primary"
              className="d-flex align-items-center gap-2"
              onClick={() => navigate('/orders')}
            >
              <FaShoppingBag /> View Orders
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderConfirmation;
