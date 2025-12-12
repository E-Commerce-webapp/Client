import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    cardLastFour: '',
    cardExpiry: '',
    cardType: '',
  });
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response:', response.data);
        if (response.data) {
          setUserData({
            ...response.data,
            // Map any fields if needed
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load user data. Please try again."
        );
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate, baseUrl]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openShippingModal = () => {
    if (userData?.savedShippingAddress) {
      setShippingForm({
        fullName: userData.savedShippingAddress.fullName || '',
        addressLine1: userData.savedShippingAddress.addressLine1 || '',
        city: userData.savedShippingAddress.city || '',
        postalCode: userData.savedShippingAddress.postalCode || '',
        country: userData.savedShippingAddress.country || '',
      });
    } else {
      setShippingForm({
        fullName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        addressLine1: '',
        city: '',
        postalCode: '',
        country: '',
      });
    }
    setShowShippingModal(true);
  };

  const openPaymentModal = () => {
    if (userData?.savedPaymentMethod) {
      setPaymentForm({
        cardLastFour: userData.savedPaymentMethod.cardLastFour || '',
        cardExpiry: userData.savedPaymentMethod.cardExpiry || '',
        cardType: userData.savedPaymentMethod.cardType || '',
      });
    } else {
      setPaymentForm({
        cardLastFour: '',
        cardExpiry: '',
        cardType: '',
      });
    }
    setShowPaymentModal(true);
  };

  const handleSaveShipping = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${baseUrl}/users/checkout-info`,
        { shippingAddress: shippingForm },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setUserData(response.data);
      setShowShippingModal(false);
    } catch (err) {
      console.error('Error saving shipping address:', err);
      setError('Failed to save shipping address.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${baseUrl}/users/checkout-info`,
        { paymentMethod: paymentForm },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setUserData(response.data);
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Error saving payment method:', err);
      setError('Failed to save payment method.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6 text-center text-sm text-muted-foreground">
        {error || "User not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        My Profile
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <h3 className="text-lg font-semibold text-foreground">
              {userData.name || "Unnamed User"}
            </h3>
            <p className="text-sm text-muted-foreground">{userData.email}</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-primary">
            {(userData.name || userData.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>

        <div className="mb-6">
          <h5 className="mb-2 text-sm font-semibold text-foreground">
            Account Information
          </h5>
          <div className="h-px w-full bg-border" />
          <div className="mt-3 grid gap-4 text-sm text-foreground md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Name
              </p>
              <p>{userData.name || "Not provided"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Email
              </p>
              <p>{userData.email}</p>
            </div>
            {userData.phone && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Phone
                </p>
                <p>{userData.phone}</p>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4>{userData.firstName} {userData.lastName}</h4>
                    <p className="text-muted mb-0">{userData.email}</p>
                    {userData.isASeller && <span className="badge bg-success">Seller</span>}
                    {userData.emailConfirm ? (
                      <span className="badge bg-success ms-2">Email Verified</span>
                    ) : (
                      <span className="badge bg-warning text-dark ms-2">Email Not Verified</span>
                    )}
                  </div>
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="text-white display-5">
                      {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5>Account Information</h5>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>First Name:</strong></p>
                      <p>{userData.firstName || 'Not provided'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Last Name:</strong></p>
                      <p>{userData.lastName || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12">
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12">
                      <p className="mb-1"><strong>Address:</strong></p>
                      <p>{userData.address || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Account Type:</strong></p>
                      <p>{userData.isASeller ? 'Seller' : 'Buyer'}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Email Status:</strong></p>
                      <p>{userData.emailConfirm ? 'Verified' : 'Not Verified'}</p>
                    </div>
                  </div>
                </div>

                {/* Saved Shipping Address Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Saved Shipping Address</h5>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={openShippingModal}
                    >
                      {userData.savedShippingAddress ? 'Edit' : 'Add'}
                    </Button>
                  </div>
                  <hr className="my-2" />
                  {userData.savedShippingAddress ? (
                    <div>
                      <p className="mb-1"><strong>{userData.savedShippingAddress.fullName}</strong></p>
                      <p className="mb-1">{userData.savedShippingAddress.addressLine1}</p>
                      <p className="mb-1">
                        {userData.savedShippingAddress.city}, {userData.savedShippingAddress.postalCode}
                      </p>
                      <p className="mb-0">{userData.savedShippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-muted">No saved shipping address.</p>
                  )}
                </div>

                {/* Saved Payment Method Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Saved Payment Method</h5>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={openPaymentModal}
                    >
                      {userData.savedPaymentMethod ? 'Edit' : 'Add'}
                    </Button>
                  </div>
                  <hr className="my-2" />
                  {userData.savedPaymentMethod ? (
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className="bi bi-credit-card fs-3"></i>
                      </div>
                      <div>
                        <p className="mb-1">
                          <strong>{userData.savedPaymentMethod.cardType || 'Card'}</strong> ending in {userData.savedPaymentMethod.cardLastFour}
                        </p>
                        <p className="mb-0 text-muted">Expires: {userData.savedPaymentMethod.cardExpiry}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">No saved payment method.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => navigate("/orders")}
          >
            View Orders
          </Button>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => navigate("/seller")}
          >
            Seller Hub
          </Button>
          <Button
            variant="outline"
            className="ml-auto text-sm text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>

      {/* Shipping Address Modal */}
      <Modal show={showShippingModal} onHide={() => setShowShippingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {userData?.savedShippingAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={shippingForm.fullName}
                onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={shippingForm.addressLine1}
                onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                placeholder="123 Main Street"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    placeholder="New York"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={shippingForm.postalCode}
                    onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                    placeholder="10001"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                as="select"
                value={shippingForm.country}
                onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShippingModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveShipping}
            disabled={saving || !shippingForm.fullName || !shippingForm.addressLine1 || !shippingForm.city || !shippingForm.postalCode || !shippingForm.country}
          >
            {saving ? <><Spinner size="sm" className="me-2" />Saving...</> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Method Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {userData?.savedPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Card Type</Form.Label>
              <Form.Control
                as="select"
                value={paymentForm.cardType}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardType: e.target.value })}
              >
                <option value="">Select card type</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
                <option value="Discover">Discover</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last 4 Digits</Form.Label>
              <Form.Control
                type="text"
                maxLength={4}
                value={paymentForm.cardLastFour}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardLastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="1234"
              />
              <Form.Text className="text-muted">
                For security, only the last 4 digits are stored.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="text"
                value={paymentForm.cardExpiry}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                placeholder="MM/YY"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSavePayment}
            disabled={saving || !paymentForm.cardLastFour || !paymentForm.cardExpiry}
          >
            {saving ? <><Spinner size="sm" className="me-2" />Saving...</> : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;
