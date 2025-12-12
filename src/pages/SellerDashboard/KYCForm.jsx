import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const KYCForm = () => {
  const [formData, setFormData] = useState({
    storeName: "",
    phoneNumber: "",
    businessAddress: "",
    businessDescription: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [canCreateStore, setCanCreateStore] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        setLoadingUser(true);
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        if (res.data?.store) {
          setCanCreateStore(false);
        } else if (res.data?.isASeller && res.data?.emailConfirm) {
          setCanCreateStore(true);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [baseUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendVerificationEmail = async () => {
    try {
      const res = await axios.get(`${baseUrl}/become-seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setSubmitted(true);
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
        `${baseUrl}/stores`,
        {
          name: formData.storeName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          description: formData.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 201) {
        alert("Store created successfully!");
        onComplete?.();
      }
    } catch (err) {
      console.error("Error creating store:", err);
      alert("Failed to create store. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!user.isASeller || !user.emailConfirm) {
      await sendVerificationEmail();
      return;
    }

    if (!formData.storeName.trim()) {
      alert("Please enter your store name.");
      return;
    }

    setSubmitting(true);
    await createStore();
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Store Setup (KYC)
      </h2>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {loadingUser ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
            Loading your profile...
          </div>
        ) : !user ? (
          <p className="text-sm text-muted-foreground">
            You need to log in to complete store setup.
          </p>
        ) : (
          <>
            <div className="mb-4 space-y-1 text-sm">
              <p className="font-medium text-foreground">
                Hello, {user.name || user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Email status:{" "}
                <span className="font-medium">
                  {user.emailConfirm ? "Verified" : "Not verified"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Seller status:{" "}
                <span className="font-medium">
                  {user.isASeller ? "Seller" : "Not a seller yet"}
                </span>
              </p>
            </div>

            {!user.isASeller || !user.emailConfirm ? (
              <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                <p className="font-medium">
                  You need to verify your email before creating a store.
                </p>
                <p>
                  Click &quot;Continue&quot; to send a verification email. This
                  page will automatically reflect your status after
                  verification.
                </p>
              </div>
            ) : canCreateStore ? (
              <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                <p className="font-medium">
                  Email verified! You can now create your store.
                </p>
              </div>
            ) : null}

            {submitted && (
              <div className="mb-4 rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-xs text-blue-600">
                A verification email has been sent.
                <br />
                <strong>This page will automatically update once you verify.</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="Enter your store name"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your contact number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Store Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter store address"
                  value={formData.address}
                  onChange={handleChange}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Describe your store (products, niche, etc.)"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting
                    ? "Processing..."
                    : canCreateStore
                    ? "Create Store"
                    : "Continue (Verify Email)"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
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
      // Prepare the request body to match the backend's expected structure
      const requestBody = {
        name: formData.storeName,
        phoneNumber: formData.phoneNumber,
        address: formData.businessAddress,
        description: formData.businessDescription
      };
      console.log('Token used for KYC:', token);
      console.log('Submitting KYC with data:', requestBody);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/become-seller`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      console.log('KYC submission response:', response.data);
      
      setSuccess(response.data.message || "Verification email sent! Please check your inbox to complete the seller registration.");
      setFormData({
        storeName: "",
        phoneNumber: "",
        businessAddress: "",
        businessDescription: "",
      });
    } catch (err) {
      console.error("Error submitting KYC:", err);
      
      // Log complete error response for debugging
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      // Extract error message
      let errorMessage = "Failed to submit KYC. Please try again.";
      if (err.response?.data) {
        // Try to get the most specific error message
        errorMessage = err.response.data.message || 
                      (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Log to console for debugging
      console.error('Error details:', {
        config: err.config,
        request: err.request,
        response: err.response,
        message: err.message,
        stack: err.stack
      });
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