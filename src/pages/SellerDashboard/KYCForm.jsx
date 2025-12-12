import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

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
  );
};

export default KYCForm;
