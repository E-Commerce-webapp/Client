import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/ProductCard";

const SellerStore = () => {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      if (!token) {
        setError("You must be logged in to view your store.");
        setLoading(false);
        return;
      }

      try {
        // First, get current user to obtain their ID
        const userRes = await axios.get(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = userRes.data;
        if (!user || !user.id) {
          throw new Error("User information is missing.");
        }

        // Then, fetch the store for this user
        const storeRes = await axios.get(`${baseUrl}/stores/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentStore = storeRes.data;
        setStore(currentStore);

        // Fetch all internal products and filter by this seller (store owner)
        const productsRes = await axios.get(`${baseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allProducts = productsRes.data || [];
        const sellerProducts = allProducts.filter(
          (p) => p.storeId === currentStore.id
        );
        setProducts(sellerProducts);
      } catch (err) {
        console.error("Error fetching store:", err);
        
        // If 404, user doesn't have a store yet - not an error, just no store
        if (err.response?.status === 404) {
          setStore(null);
          setLoading(false);
          return;
        }
        
        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load store information.";
        setError(typeof message === "string" ? message : "Failed to load store information.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [baseUrl, token]);

  const getStatusBadgeClasses = (status) => {
    if (!status) return "";
    const normalized = status.toString();
    
    if (normalized === "ACTIVE") return "bg-emerald-500/20 text-emerald-700 border-emerald-400/40";
    if (normalized === "PENDING") return "bg-amber-500/20 text-amber-700 border-amber-400/40";
    if (normalized === "SUSPENDED") return "bg-red-500/20 text-red-700 border-red-400/40";
    return "bg-zinc-500/20 text-zinc-700 border-zinc-400/40";
  };

  const formatStatus = (status) => {
    if (!status) return "";
    const normalized = status.toString();
    return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700">
          No store found for your account.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 flex items-center text-xl font-bold text-foreground">
        My Store
        {store.status && (
          <span className={`ml-2 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(store.status)}`}>
            {formatStatus(store.status)}
          </span>
        )}
      </h2>

      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-1 text-lg font-bold text-foreground">{store.name}</h4>
            <div className="text-sm text-muted-foreground">Store ID: {store.id}</div>
          </div>
          <div className="md:text-right">
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-semibold text-foreground">{store.phoneNumber || "Not provided"}</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="mb-1 text-sm text-muted-foreground">Address</div>
          <div className="text-foreground">{store.address || "Not provided"}</div>
        </div>

        <div>
          <div className="mb-1 text-sm text-muted-foreground">Description</div>
          <div className="text-foreground">{store.description || "No description provided."}</div>
        </div>
      </div>

      <h4 className="mb-3 text-lg font-bold text-foreground">Products in this Store</h4>

      {products.length === 0 ? (
        <div className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700">
          You have no products in this store yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerStore;
