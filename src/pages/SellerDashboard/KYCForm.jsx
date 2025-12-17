import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function KYCForm({ onComplete }) {
  const [formData, setFormData] = useState({
    storeName: "",
    phoneNumber: "",
    businessAddress: "",
    businessDescription: "",
  });

  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndStore = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        setLoadingUser(true);
        setError("");

        // Fetch user data
        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);

        // Try to fetch existing store for this user
        if (res.data?.id) {
          try {
            const storeRes = await axios.get(`${baseUrl}/stores/user/${res.data.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setStore(storeRes.data);
          } catch (storeErr) {
            // 404 means no store yet, which is fine
            if (storeErr.response?.status !== 404) {
              console.error("Error fetching store:", storeErr);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
            "Failed to load your profile. Please try again."
        );
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndStore();
  }, [baseUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResendVerification = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const res = await axios.post(`${baseUrl}/users/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setSuccess("Verification email resent! Please check your inbox.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const submitKYCForm = async () => {
    // This endpoint creates store with PENDING status and sends verification email
    // After user verifies email, store becomes ACTIVE and user becomes seller
    const payload = {
      name: formData.storeName,
      phoneNumber: formData.phoneNumber,
      address: formData.businessAddress,
      description: formData.businessDescription,
    };

    const res = await axios.post(`${baseUrl}/users/become-seller`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 200) {
      setSubmitted(true);
      setSuccess(
        "Your store has been created with pending status. Verification email sent! Please check your inbox and click the link to activate your store."
      );
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!user) return;

    // Validate required fields
    if (!formData.storeName.trim()) {
      setError("Please enter your store name.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!formData.businessAddress.trim()) {
      setError("Please enter your business address.");
      return;
    }

    try {
      setSubmitting(true);
      await submitKYCForm();
    } catch (err) {
      console.error("KYC error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Seller Registration
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You need to log in to register as a seller.
          </p>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h2 className="text-lg font-semibold text-foreground">
        Store Setup (KYC)
      </h2>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
            {success}
          </div>
        )}

        {!user ? (
          <p className="text-sm text-muted-foreground">
            Could not load user profile.
          </p>
        ) : (
          <>
            <div className="mb-4 space-y-1 text-sm">
              <p className="font-medium text-foreground">
                Hello, {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Seller status:{" "}
                <span className="font-medium">
                  {user.isASeller ? "Active Seller" : "Not a seller yet"}
                </span>
              </p>
            </div>

            {/* User already has a store */}
            {store ? (
              <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${store.status === "PENDING" ? "border-amber-400/40 bg-amber-500/10 text-amber-700" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-700"}`}>
                <p className="font-medium">You already have a store!</p>
                <p className="mt-1">Store: <b>{store.name}</b></p>
                <p>Status: <b>{store.status}</b></p>
                {store.status === "PENDING" && (
                  <>
                    <p className="mt-2 text-xs">Please check your email and click the verification link to activate your store.</p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="mt-2 text-xs font-medium underline hover:no-underline disabled:opacity-50"
                    >
                      {resending ? "Sending..." : "Resend verification email"}
                    </button>
                  </>
                )}
              </div>
            ) : submitted ? (
              <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                <p className="font-medium">Verification email sent!</p>
                <p>Your store has been created with pending status. Please check your inbox and click the verification link to activate your store and become a seller.</p>
              </div>
            ) : (
              <div className="mb-4 rounded-lg border border-blue-400/40 bg-blue-500/10 px-3 py-2 text-xs text-blue-700">
                <p className="font-medium">Become a Seller</p>
                <p>Fill in the form below to create your store. After submitting, you'll receive a verification email. Click the link to activate your store.</p>
              </div>
            )}

            {/* Only show form if user doesn't have a store yet and hasn't submitted */}
            {!store && !submitted && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Enter your store name"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="Enter business address"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Business Description
                  </label>
                  <textarea
                    name="businessDescription"
                    rows={3}
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe your store"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Processing..." : "Submit & Send Verification Email"}
                  </Button>
                </div>
              </form>
            )}

            {/* Show button to go to store if user already has one */}
            {store && store.status === "ACTIVE" && (
              <div className="pt-2">
                <Button onClick={() => navigate("/seller/store")} className="w-full">
                  Go to My Store
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
