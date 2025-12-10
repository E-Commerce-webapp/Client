import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BecomeSeller = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleBecomeSeller = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/become-seller' } });
      return;
    }

    setIsSubmitting(true);
    try {
      // Navigate to KYC form
      navigate('/seller/kyc');
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!token) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm">
          <Card.Body className="text-center p-5">
            <h2 className="mb-4">Become a Seller</h2>
            <p className="lead mb-4">
              To start selling on EcomSphere, please sign in to your account or create a new one.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" onClick={() => navigate('/login', { state: { from: '/become-seller' } })}>
                Sign In
              </Button>
              <Button variant="outline-primary" onClick={() => navigate('/register', { state: { from: '/become-seller' } })}>
                Create Account
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (user?.isASeller) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm">
          <Card.Body className="text-center p-5">
            <h2 className="mb-4">Welcome to Seller Hub</h2>
            <p className="lead mb-4">
              You're already a seller on EcomSphere. Visit your seller dashboard to manage your products and orders.
            </p>
            <Button variant="primary" onClick={() => navigate('/seller')}>
              Go to Seller Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-5">
          <div className="text-center mb-5">
            <h2>Become a Seller on EcomSphere</h2>
            <p className="lead">Reach millions of customers and grow your business with us</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="row">
            <div className="col-lg-6 mb-4">
              <h4 className="mb-4">Why sell on EcomSphere?</h4>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <h5>Reach Millions of Customers</h5>
                  <p>Access to our large and growing customer base</p>
                </li>
                <li className="mb-3">
                  <h5>Easy Setup</h5>
                  <p>Simple and quick registration process</p>
                </li>
                <li className="mb-3">
                  <h5>Secure Payments</h5>
                  <p>Get paid directly to your bank account</p>
                </li>
                <li className="mb-3">
                  <h5>24/7 Support</h5>
                  <p>Dedicated support team to help you grow</p>
                </li>
              </ul>
            </div>

            <div className="col-lg-6">
              <div className="border p-4 rounded">
                <h4 className="mb-4">Get Started</h4>
                <p className="mb-4">
                  Complete the seller registration process to start selling on EcomSphere. You'll need to provide some basic information about your business.
                </p>

                <div className="mb-4">
                  <h5>Requirements:</h5>
                  <ul>
                    <li>Valid government-issued ID</li>
                    <li>Bank account information</li>
                    <li>Business details (if applicable)</li>
                    <li>Tax information</li>
                  </ul>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  onClick={handleBecomeSeller}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Start Seller Registration'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BecomeSeller;
