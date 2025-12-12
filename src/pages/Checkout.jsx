import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { isTokenValid } from "../utils/auth";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!cart.length) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="mb-2 text-lg font-semibold text-foreground">
          Your cart is empty
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Add some items to your cart before checking out.
        </p>
        <Button onClick={() => navigate("/")}>Go to Home</Button>
      </div>
    );
  }
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveShipping, setSaveShipping] = useState(true);
  const [savePayment, setSavePayment] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [userSavedInfo, setUserSavedInfo] = useState({ hasShipping: false, hasPayment: false });
  const navigate = useNavigate();

  // Load saved info on mount
  useEffect(() => {
    const loadSavedInfo = async () => {
      try {
        const response = await api.get('/users');
        const user = response.data;
        
        // Track what the user already has saved
        setUserSavedInfo({
          hasShipping: !!user.savedShippingAddress,
          hasPayment: !!user.savedPaymentMethod,
        });
        
        if (user.savedShippingAddress) {
          const nameParts = user.savedShippingAddress.fullName.split(' ');
          setFormData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            address: user.savedShippingAddress.addressLine1 || '',
            city: user.savedShippingAddress.city || '',
            zipCode: user.savedShippingAddress.postalCode || '',
            country: user.savedShippingAddress.country || '',
          }));
        }
        
        if (user.savedPaymentMethod) {
          setFormData(prev => ({
            ...prev,
            cardNumber: `**** **** **** ${user.savedPaymentMethod.cardLastFour}`,
            cardExpiry: user.savedPaymentMethod.cardExpiry || '',
          }));
        }
        
        if (user.email) {
          setFormData(prev => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        console.log('No saved info found or not logged in');
      }
    };
    
    loadSavedInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.address ||
      !formData.city ||
      !formData.zipCode ||
      !formData.country ||
      !formData.email
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const shippingCost = 10.0;
      const taxAmount = 0.0;

      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          productTitle: item.title || item.name,
          productImage:
            item.image || item.images?.[0] || "/images/placeholder.jpg",
          quantity: item.quantity,
          price: parseFloat(item.price),
          sellerId: item.seller_id || "default-seller",
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine1: formData.address,
          addressLine2: null,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country,
          phoneNumber: formData.email,
        },
        paymentMethod: "card",
        shippingAmount: shippingCost,
        taxAmount: taxAmount,
        totalAmount: cartTotal + shippingCost + taxAmount,
      };

      const res = await axios.post(`${baseUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearCart();
      navigate(`/order-confirmation/${res.data.id}`);
      setSuccess(`Order #${orderId} placed successfully!`);
      setPendingOrderId(orderId);
      
      // Only show save modal if user doesn't have saved info yet
      const needsShippingSave = !userSavedInfo.hasShipping;
      const needsPaymentSave = !userSavedInfo.hasPayment && formData.paymentMethod === 'credit-card';
      
      if (needsShippingSave || needsPaymentSave) {
        setSaveShipping(needsShippingSave);
        setSavePayment(needsPaymentSave);
        setShowSaveModal(true);
      } else {
        // User already has saved info, go directly to order page
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const saveData = {};
      
      if (saveShipping) {
        saveData.shippingAddress = {
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country,
        };
      }
      
      if (savePayment && formData.paymentMethod === 'credit-card' && formData.cardNumber) {
        // Only save last 4 digits for security
        const cardNum = formData.cardNumber.replace(/\s/g, '');
        const lastFour = cardNum.slice(-4);
        saveData.paymentMethod = {
          cardLastFour: lastFour,
          cardExpiry: formData.cardExpiry,
          cardType: detectCardType(cardNum),
        };
      }
      
      if (saveData.shippingAddress || saveData.paymentMethod) {
        await api.put('/users/checkout-info', saveData);
        console.log('Checkout info saved successfully');
      }
    } catch (err) {
      console.error('Failed to save checkout info:', err);
    } finally {
      setSavingInfo(false);
      setShowSaveModal(false);
      navigate(`/orders/${pendingOrderId}`);
    }
  };

  const handleSkipSave = () => {
    setShowSaveModal(false);
    navigate(`/orders/${pendingOrderId}`);
  };

  const detectCardType = (cardNumber) => {
    const num = cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^6(?:011|5)/.test(num)) return 'Discover';
    return 'Card';
  };

  if (cart.length === 0 && !success) {
    return (
      <Container className="py-5 text-center">
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart before checking out.</p>
        <Button variant="primary" onClick={() => navigate("/")}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  const shippingCost = 10.0;
  const taxAmount = 0.0;
  const totalWithExtras = cartTotal + shippingCost + taxAmount;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="mb-1 text-xl font-semibold text-foreground">
        Checkout
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Enter your shipping details and place your order.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,1.3fr]">
        <form
          onSubmit={placeOrder}
          className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Shipping Information
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Address
            </label>
            <input
              name="address"
              type="text"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                City
              </label>
              <input
                name="city"
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                ZIP / Postal Code
              </label>
              <input
                name="zipCode"
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Country
              </label>
              <input
                name="country"
                type="text"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Placing order..." : "Place Order"}
            </Button>
          </div>
        </form>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5 text-sm shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Order Summary
          </h3>
          <div className="space-y-3 border-b border-border pb-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                    <img
                      src={item.images || item.images?.[0]}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="line-clamp-1 font-medium text-foreground">
                      {item.name}
                    </div>
                    <div className="text-muted-foreground">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          </div>

          <div className="mt-2 flex justify-between text-sm font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(totalWithExtras)}</span>
          </div>
        </div>
      </div>
    </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Save Info Modal */}
      <Modal show={showSaveModal} onHide={handleSkipSave} centered>
        <Modal.Header closeButton>
          <Modal.Title>Save Your Information?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Would you like to save your information for faster checkout next time?</p>
          
          {!userSavedInfo.hasShipping && (
            <Form.Check
              type="checkbox"
              id="save-shipping"
              label="Save shipping address"
              checked={saveShipping}
              onChange={(e) => setSaveShipping(e.target.checked)}
              className="mb-2"
            />
          )}
          
          {!userSavedInfo.hasPayment && formData.paymentMethod === 'credit-card' && (
            <Form.Check
              type="checkbox"
              id="save-payment"
              label="Save payment method (only last 4 digits)"
              checked={savePayment}
              onChange={(e) => setSavePayment(e.target.checked)}
              className="mb-2"
            />
          )}
          
          <small className="text-muted">
            Your information will be securely stored and can be used for future orders.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSkipSave}>
            No, Thanks
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveInfo}
            disabled={savingInfo || (!saveShipping && !savePayment)}
          >
            {savingInfo ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Information'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Checkout;
