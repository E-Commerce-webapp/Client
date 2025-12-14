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
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [canCreateStore, setCanCreateStore] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        setLoadingUser(true);
        setError("");

        const res = await axios.get(`${baseUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);

        if (res.data?.store) {
          setCanCreateStore(false);
          return;
        }

        if (res.data?.isASeller && res.data?.emailConfirm) {
          setCanCreateStore(true);
        } else {
          setCanCreateStore(false);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load your profile. Please try again."
        );
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
    const res = await axios.get(`${baseUrl}/become-seller`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 200) {
      setSubmitted(true);
      setSuccess(
        "Verification email sent! Please check your inbox and click the link."
      );
      return true;
    }
    return false;
  };

  const createStore = async () => {
    const payload = {
      name: formData.storeName,
      phoneNumber: formData.phoneNumber,
      address: formData.businessAddress,
      description: formData.businessDescription,
    };

    const res = await axios.post(`${baseUrl}/stores`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 201 || res.status === 200) {
      setSuccess("Store created successfully!");
      onComplete?.();
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

    try {
      setSubmitting(true);

      if (!user.isASeller || !user.emailConfirm) {
        await sendVerificationEmail();
        return;
      }

      if (!formData.storeName.trim()) {
        setError("Please enter your store name.");
        return;
      }

      await createStore();
    } catch (err) {
      console.error("KYC error:", err);
      setError(
        err.response?.data?.message ||
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
                  Click <b>Continue</b> to send a verification email. After you
                  verify, refresh this page and you can create your store.
                </p>
              </div>
            ) : canCreateStore ? (
              <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                Email verified! You can now create your store.
              </div>
            ) : null}

            {submitted && (
              <div className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                Verification email has been sent. Please check your inbox.
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
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="Enter your store name"
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
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Business Address
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
                  required
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={submitting} className="w-full">
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
}
