import React, { useState } from "react";
import { Form, Button, Card, Container, ProgressBar } from "react-bootstrap";

const KYCForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, we would send this data to the backend
    console.log("KYC Data Submitted:", formData);
    onComplete();
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Become a Seller</h2>
        <p className="text-muted">
          Complete the verification process to start selling on our platform.
          This typically takes 2-3 business days to review.
        </p>
      </div>

      <Card className="shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <Card.Body className="p-4">
          <div className="mb-4">
            <h5 className="mb-1">Seller Verification</h5>
            <p className="text-muted small">
              Complete KYC verification to start selling on our platform
            </p>
            <ProgressBar
              now={25}
              label="Step 1 of 4"
              className="mb-2"
              style={{ height: "8px" }}
              variant="dark"
            />
            <small className="text-muted">Step 1 of 4</small>
          </div>

          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-person"></i>
            </div>
            <div>
              <h5 className="mb-0">Personal Information</h5>
              <small className="text-muted">Tell us about yourself</small>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                required
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="bg-light"
              />
            </Form.Group>

            <Button variant="dark" type="submit" className="w-100 py-2 mt-3">
              Continue
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default KYCForm;
