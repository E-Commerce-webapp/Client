import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/LoginPage/Login";
import ProductDetail from "./pages/ProductDetail";
import SearchResults from "./pages/SearchResults";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import SellerDashboard from "./pages/SellerDashboard/SellerDashboard";
import SellProduct from "./pages/SellProduct";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { isTokenValid } from "./utils/auth";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/products/external`);
      console.log("Fetched products:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (!isTokenValid(token)) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <CartProvider>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home products={products} loading={loading} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products/:productId" element={<ProductDetail products={products} />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* Protected Routes */}
          <Route path="/seller" element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/sell" element={
            <ProtectedRoute>
              <SellProduct />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-confirmation/:orderId" element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } />
          <Route path="/orders/:orderId" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </CartProvider>
  );
}