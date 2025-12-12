import { useParams } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function ProductDetail({ products }) {
  const { productId } = useParams();
  const product = products.find((p) => p.id === productId);
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

export default function ProductDetail({ products }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const { addToCart } = useCart();

  if (!products || products.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        Loading product...
      </div>
    );
  const isLoggedIn = !!localStorage.getItem('token');

  const handleReviewSubmitted = () => {
    setReviewRefresh(prev => prev + 1);
  };

  useEffect(() => {
    const loadProduct = async () => {
      // 1) Try external products first
      const fromExternal = products.find(
        (p) => String(p.id) === String(productId)
      );
      if (fromExternal) {
        setProduct(fromExternal);
        setLoading(false);
        return;
      }

      // 2) Fallback: fetch single internal product by id
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching internal product by id:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, products]);

  if (loading) {
    return <div className="container mt-4">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        Product not found
      </div>
    );
  }

  const maxStock = product.stock;
  const mainImage = product.images?.[0];

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= maxStock) {
      addToCart(product, quantity);
      alert(
        `${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`
      );
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxStock) {
      setQuantity(value);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={mainImage}
              alt={product.title}
              className="h-full w-full max-h-[480px] object-cover"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            {product.title}
          </h2>

          <h4 className="mb-3 text-xl font-semibold text-foreground">
            ${product.price.toFixed(2)}
          </h4>

          <p className="mb-4 text-sm text-muted-foreground">
            {product.description}
          </p>

          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Quantity
            </label>

            <div className="flex max-w-xs items-center gap-2">
              <Button
        <div className="col-md-6">
          <h2>{product.title}</h2>
          <p className="text-muted mb-2">
            Store:{' '}
            {product.storeName && product.storeId ? (
              <span
                className="text-primary"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/store/${product.storeId}`)}
              >
                {product.storeName}
              </span>
            ) : (
              <span className="text-secondary">Unknown</span>
            )}
          </p>
          <h4 className="my-3">${product.price.toFixed(2)}</h4>
          <p className="mb-4">{product.description}</p>
          
          <div className="mb-3">
            <label htmlFor="quantity" className="form-label">Quantity:</label>
            <div className="input-group mb-3" style={{ maxWidth: '150px' }}>
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setQuantity((prev) => Math.max(1, prev - 1))
                }
                disabled={quantity <= 1}
              >
                −
              </Button>

              <input
                id="quantity"
                type="number"
                className="h-9 w-16 rounded-md border border-input bg-background text-center text-sm text-foreground outline-none ring-offset-background focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={maxStock}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setQuantity((prev) => Math.min(maxStock, prev + 1))
                }
                disabled={quantity >= maxStock}
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
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <i className="bi bi-check-circle text-emerald-500" />
              {maxStock > 0
                ? `${maxStock} in stock`
                : "Currently out of stock"}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <hr className="mb-4" />
          
          {/* Review Form - only show if logged in */}
          {isLoggedIn ? (
            <ReviewForm 
              productId={productId} 
              onReviewSubmitted={handleReviewSubmitted} 
            />
          ) : (
            <div className="alert alert-secondary mb-4">
              <a href="/login" className="alert-link">Log in</a> to write a review.
            </div>
          )}

          {/* Reviews List */}
          <ReviewList 
            productId={productId} 
            refreshTrigger={reviewRefresh} 
          />
        </div>
      </div>
    </div>
  );
}
