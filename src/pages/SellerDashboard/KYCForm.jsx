import React, { useState, useEffect } from "react";
import { Form, Button, Card, Container, ProgressBar } from "react-bootstrap";
import axios from "axios";

const KYCForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    storeName: "",
    phoneNumber: "",
    address: "",
    description: "",
  });

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    let interval;

    if (user && !user.isASeller && !user.emailConfirm) {
      interval = setInterval(async () => {
        console.log("Checking verification status...");

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/users`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data.isASeller && res.data.emailConfirm) {
            setUser(res.data);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [user]);

  const canCreateStore =
    user?.isASeller === true && user?.emailConfirm === true;

  const sendVerificationEmail = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users/become-seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        alert(
          "Verification email sent! Please check your inbox and click the link, then come back to create your store."
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error sending verification email:", err);
      alert("Failed to send verification email.");
      return false;
    }
  };

  const createStore = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/stores`,
        {
          name: formData.storeName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        alert("Store created successfully!");
        return true;
      }
      alert("Failed to create store.");
      return false;
    } catch (err) {
      console.error("Error creating store:", err);
      alert("Error creating store.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("You must be logged in first.");
      return;
    }

    setSubmitting(true);
    if(canCreateStore){
      setSubmitted(false);
    }

    try {
      await fetchUser();

      if (canCreateStore) {
        const ok = await createStore();
        if (ok && onComplete) onComplete();
      } else {
        await sendVerificationEmail();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Become a Seller</h2>
        <p className="text-muted">
          Complete the verification process to start selling on our platform.
          This typically takes 2–3 business days to review.
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
              <h5 className="mb-0">Store Information</h5>
              <small className="text-muted">Tell us about your store</small>
            </div>
          </div>

          {loadingUser ? (
            <p>Loading your info...</p>
          ) : (
            <>
              {!canCreateStore && (
                <div className="alert alert-info py-2">
                  <strong>Step 1:</strong> Verify your email to become a seller.
                  Click "Continue" to get a verification email.
                </div>
              )}

              {canCreateStore && (
                <div className="alert alert-success py-2">
                  Email verified! Fill in your store details and click "Create
                  Store".
                </div>
              )}
              {submitted && (
                <div className="alert alert-info py-2">
                  A verification email has been sent.
                  <br />
                  <strong>
                    This page will automatically update once you verify.
                  </strong>
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="storeName"
                    placeholder="Enter your store name"
                    value={formData.storeName}
                    onChange={(e) =>
                      setFormData({ ...formData, storeName: e.target.value })
                    }
                    required
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter your store phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value,
                      })
                    }
                    required
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="Enter your store address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    required
                    className="bg-light"
                  />
                </Form.Group>

                <Button
                  variant="dark"
                  type="submit"
                  className="w-100 py-2 mt-3"
                  disabled={submitting || loadingUser}
                >
                  {submitting
                    ? "Processing..."
                    : canCreateStore
                    ? "Create Store"
                    : "Continue (Verify Email)"}
                </Button>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default KYCForm;
