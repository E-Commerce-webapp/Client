import React, { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { isTokenValid } from "../utils/auth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Checkout() {
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

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveShipping, setSaveShipping] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);

  const [userSavedInfo, setUserSavedInfo] = useState({
    hasShipping: false,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadSavedInfo = async () => {
      if (!token || !isTokenValid(token)) return;

      try {
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;

        setUserSavedInfo({
          hasShipping: !!user?.savedShippingAddress,
        });

        if (user?.savedShippingAddress) {
          const fullName = user.savedShippingAddress.fullName || "";
          const parts = fullName.split(" ");
          setFormData((prev) => ({
            ...prev,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            address: user.savedShippingAddress.addressLine1 || "",
            city: user.savedShippingAddress.city || "",
            zipCode: user.savedShippingAddress.postalCode || "",
            country: user.savedShippingAddress.country || "",
          }));
        }

        if (user?.email) {
          setFormData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        console.error("Failed to load saved checkout info:", err);
      }
    };

    loadSavedInfo();
  }, [baseUrl, token]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      amount || 0
    );

  const shippingCost = 10.0;
  const taxAmount = 0.0;
  const totalWithExtras = cartTotal + shippingCost + taxAmount;

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!token || !isTokenValid(token)) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "zipCode",
      "country",
      "email",
    ];
    const missing = requiredFields.some((k) => !String(formData[k] || "").trim());
    if (missing) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cart.map((item) => ({
          productId: item.id,
          productTitle: item.title || item.name,
          productImage: item.image || item.images?.[0] || "/images/placeholder.jpg",
          quantity: item.quantity,
          price: parseFloat(item.price),
          sellerId: item.seller_id || "default-seller",
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
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
        totalAmount: totalWithExtras,
      };

      const res = await axios.post(`${baseUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderId = res.data?.id;
      clearCart();

      if (!userSavedInfo.hasShipping) {
        setPendingOrderId(orderId);
        setSaveShipping(true);
        setShowSaveModal(true);
      } else {
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!pendingOrderId) return;

    setSavingInfo(true);
    try {
      if (saveShipping) {
        const saveData = {
          shippingAddress: {
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            addressLine1: formData.address,
            city: formData.city,
            postalCode: formData.zipCode,
            country: formData.country,
          },
        };

        await axios.put(`${baseUrl}/users/checkout-info`, saveData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Failed to save checkout info:", err);
    } finally {
      setSavingInfo(false);
      setShowSaveModal(false);
      navigate(`/order-confirmation/${pendingOrderId}`);
    }
  };

  const handleSkipSave = () => {
    setShowSaveModal(false);
    navigate(`/order-confirmation/${pendingOrderId}`);
  };

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-1 text-xl font-semibold text-foreground">Checkout</h2>
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
                <label className="text-xs font-medium text-foreground">First Name</label>
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
                <label className="text-xs font-medium text-foreground">Last Name</label>
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
              <label className="text-xs font-medium text-foreground">Address</label>
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
                <label className="text-xs font-medium text-foreground">City</label>
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
                <label className="text-xs font-medium text-foreground">Country</label>
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
              <label className="text-xs font-medium text-foreground">Email</label>
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
              <Button type="submit" className="w-full" disabled={loading}>
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
                        src={item.image || item.images?.[0]}
                        alt={item.title || item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="line-clamp-1 font-medium text-foreground">
                        {item.title || item.name}
                      </div>
                      <div className="text-muted-foreground">Qty: {item.quantity}</div>
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

      <Dialog open={showSaveModal} onOpenChange={(open) => !open && handleSkipSave()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save your shipping info?</DialogTitle>
            <DialogDescription>
              Save your shipping address for faster checkout next time.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex items-start gap-2 text-sm">
            <input
              id="saveShipping"
              type="checkbox"
              checked={saveShipping}
              onChange={(e) => setSaveShipping(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <label htmlFor="saveShipping" className="text-foreground">
              Save shipping address
            </label>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleSkipSave} disabled={savingInfo}>
              No, thanks
            </Button>
            <Button
              onClick={handleSaveInfo}
              disabled={savingInfo || !saveShipping}
            >
              {savingInfo ? "Saving..." : "Save & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
