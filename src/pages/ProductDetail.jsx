import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageSquare, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCart } from "../contexts/CartContext";

import api from "../utils/api";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";

export default function ProductDetail({ products = [] }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [userStoreId, setUserStoreId] = useState(null);
  const [copied, setCopied] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || product?.name || 'Check out this product',
          text: product?.description?.slice(0, 100) || 'Check out this product on EcomSphere',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleReviewSubmitted = () => setReviewRefresh((prev) => prev + 1);

  useEffect(() => {
    const fetchUserStore = async () => {
      if (!isLoggedIn) {
        setUserStoreId(null);
        return;
      }
      try {
        const res = await api.get("/stores/my-store");
        setUserStoreId(res.data?.id || null);
      } catch (err) {
        setUserStoreId(null);
      }
    };
    fetchUserStore();
  }, [isLoggedIn]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      const fromExternal = products.find(
        (p) => String(p.id) === String(productId)
      );

      if (fromExternal) {
        setProduct(fromExternal);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product by id:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, products]);

  const maxStock = useMemo(() => {
    const s = product?.stock ?? product?.stock_quantity ?? 0;
    return Number.isFinite(Number(s)) ? Number(s) : 0;
  }, [product]);

  const mainImage = product?.images?.[0] || product?.image || "/images/placeholder.jpg";

  const handleAddToCart = () => {
    if (!product) return;
    if (quantity < 1 || quantity > maxStock) return;

    addToCart(product, quantity);
    alert(`${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.max(1, Math.min(maxStock || 1, value)));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        Product not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={mainImage}
              alt={product.title || product.name}
              className="h-full w-full max-h-[480px] object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.jpg";
              }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h2 className="text-2xl font-semibold text-foreground">
              {product.title || product.name}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </DropdownMenuItem>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <DropdownMenuItem onClick={handleShareNative} className="cursor-pointer">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            Store:{" "}
            {product.storeName && product.storeId ? (
              <button
                type="button"
                className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
                onClick={() => navigate(`/store/${product.storeId}`)}
              >
                {product.storeName}
              </button>
            ) : (
              <span className="text-muted-foreground">Unknown</span>
            )}
          </p>

          <h4 className="mb-3 text-xl font-semibold text-foreground">
            ${Number(product.price || 0).toFixed(2)}
          </h4>

          <p className="mb-4 text-sm text-muted-foreground">
            {product.description}
          </p>

          <div className="mb-4">
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-foreground">
              Quantity
            </label>

            <div className="flex max-w-xs items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                −
              </Button>

              <input
                id="quantity"
                type="number"
                className="h-9 w-20 rounded-md border border-input bg-background text-center text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={maxStock || 1}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((prev) => Math.min(maxStock || 1, prev + 1))}
                disabled={maxStock > 0 ? quantity >= maxStock : true}
              >
                +
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              className="w-full sm:w-auto"
              onClick={handleAddToCart}
              disabled={maxStock <= 0}
            >
              Add to Cart
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/cart")}
            >
              Go to Cart
            </Button>

            {product.storeId && isLoggedIn && product.storeId !== userStoreId && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/messages?storeId=${product.storeId}&productId=${productId}`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Seller
              </Button>
            )}
          </div>

          {product.storeId && !isLoggedIn && (
            <p className="mb-4 text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                Log in
              </Link>{" "}
              to contact the seller.
            </p>
          )}

          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <p className="text-muted-foreground">
              {maxStock > 0 ? `${maxStock} in stock` : "Currently out of stock"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 border-t border-border pt-6" />

        {isLoggedIn ? (
          <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
        ) : (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
              Log in
            </Link>{" "}
            to write a review.
          </div>
        )}

        <ReviewList productId={productId} refreshTrigger={reviewRefresh} />
      </div>
    </div>
  );
}
