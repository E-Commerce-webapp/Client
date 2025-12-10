import React, { useState, useEffect } from "react";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const KYCForm = () => {
  const [formData, setFormData] = useState({
    storeName: "",
    phoneNumber: "",
    businessAddress: "",
    businessDescription: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/submit-kyc`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess("Verification email sent! Please check your inbox to complete the seller registration.");
      setFormData({
        storeName: "",
        phoneNumber: "",
        businessAddress: "",
        businessDescription: "",
      });
    } catch (err) {
      console.error("Error submitting KYC:", err);
      setError(err.response?.data?.message || "Failed to submit KYC. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (res.data.isASeller) {
          navigate('/seller');
        }
      } catch (err) {
        console.error("Error checking seller status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSellerStatus();
  }, [token, navigate]);

  useEffect(() => {
    const verifySeller = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/verify-seller?token=${token}`
          );
          
          if (res.data.success) {
            localStorage.setItem('isSellerVerified', 'true');
            navigate('/seller');
          } else {
            setError("Verification failed. The link may have expired or is invalid.");
          }
        } catch (err) {
          console.error("Verification error:", err);
          setError("Failed to verify seller. Please try again.");
        }
      }
    };

    verifySeller();
  }, [navigate]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!token) {
    return (
      <Container className="py-5">
        <Card className="shadow">
          <Card.Body className="text-center p-5">
            <h2>Seller Registration</h2>
            <p className="lead">You need to be logged in to register as a seller.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/login', { state: { from: '/become-seller' } })}
            >
              Log In / Register
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Become a Seller</h2>
        </Card.Header>
        <Card.Body className="p-4">
          <h4 className="mb-4">Seller Application</h4>
          <p className="text-muted mb-4">
            Complete the form below to register as a seller. After submission, you'll receive a verification email to confirm your seller account.
          </p>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Store/Business Name *</Form.Label>
              <Form.Control
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="Enter your store or business name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter your business phone number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Business Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                required
                placeholder="Enter your business address"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Business Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                required
                placeholder="Tell us about your business and what you plan to sell"
              />
              <Form.Text className="text-muted">
                Minimum 50 characters. Be descriptive about your products and business.
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting}
                size="lg"
                className="mt-3"
              >
                {submitting ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </Form>
          
          <div className="mt-4 pt-3 border-top">
            <h5>What happens next?</h5>
            <ol className="ps-3">
              <li>Submit your application</li>
              <li>Check your email for a verification link</li>
              <li>Click the link to verify your seller account</li>
              <li>Start listing your products!</li>
            </ol>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default KYCForm;