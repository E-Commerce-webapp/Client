import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import api from "../utils/api";

const SellProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: 1,
    image: null,
    imageBase64: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [storeId, setStoreId] = useState("");
  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] || null }));
      return;
    }

    if (name === "stock") {
      const numberValue = parseInt(value, 10) || 1;
      setFormData((prev) => ({ ...prev, stock: numberValue }));
      return;
    }

    if (name === "price") {
      setFormData((prev) => ({ ...prev, price: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const initStore = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isTokenValid(token)) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      try {
        setIsStoreLoading(true);
        // Fetch current user to get their backend id
        const userRes = await api.get("/users");
        const user = userRes.data;
        if (!user || !user.id) {
          throw new Error("User information is missing.");
        }

        const response = await api.get(`/stores/user/${user.id}`);
        setStoreId(response.data.id);
      } catch (err) {
        console.error("Error fetching store:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load your store information. Please make sure you have an active store."
        );
      } finally {
        setIsStoreLoading(false);
      }
    };

    initStore();
  }, [navigate]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required.");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Product description is required.");
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid price greater than 0.");
      return false;
    }
    if (!formData.category.trim()) {
      setError("Please choose a category.");
      return false;
    }
    if (!formData.stock || Number(formData.stock) < 1) {
      setError("Stock quantity must be at least 1.");
      return false;
    }
    if (!storeId) {
      setError("Could not determine your store. Please ensure you have an active store.");
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageBase64: typeof base64String === "string" ? base64String : "",
      }));
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert numeric fields to numbers
    const processedValue =
      type === "number" ? (value === "" ? "" : parseFloat(value)) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        title: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: Number(formData.stock),
        images: formData.imageBase64,
        storeId: storeId,
      };

      const response = await api.post("/products", payload);

      await axios.post(`${baseUrl}/products`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      console.log("Product created:", response.data);
      setSuccess("Product listed successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: 1,
        image: null,
        imageBase64: "",
      });
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      setSuccess("Product listed successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: 1,
        image: null,
      });
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to list product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-1 text-xl font-semibold text-foreground">
        Sell a Product
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Fill in the details below to list your product for sale.
      </p>

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

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Product Name
            </label>
            <input
              id="name"
              name="name"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              placeholder="Enter a clear product title"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              placeholder="Describe your product details, condition, etc."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>


          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="price"
                className="text-sm font-medium text-foreground"
              >
                Price ($)
              </label>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                name="price"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="stock"
                className="text-sm font-medium text-foreground"
              >
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                min="1"
                name="stock"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.stock}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="category"
              className="text-sm font-medium text-foreground"
            >
              Category
            </label>
            <input
              id="category"
              name="category"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
              placeholder="e.g. Electronics, Fashion"
              value={formData.category}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="image"
              className="text-sm font-medium text-foreground"
            >
              Product Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
              onChange={handleChange}
              disabled={isLoading}
              onChange={handleImageChange}
              required
              disabled={isLoading || isStoreLoading}
            />
            <p className="text-xs text-muted-foreground">
              Optional, but recommended. Upload a clear photo of your product.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2"
              size="lg"
              disabled={isLoading || isStoreLoading}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent" />
                  Listing...
                </>
              ) : (
                isStoreLoading ? "Loading your store..." : "List Product for Sale"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellProduct;
