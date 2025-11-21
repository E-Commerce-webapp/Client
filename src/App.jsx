import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/LoginPage/Login.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import Cart from "./pages/Cart.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import { useState, useEffect } from "react";
import axios from "axios";


export default function App() {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [products, setProducts] = useState([]);
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/products/external`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data);
      console.log("Fetched products:", response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  return (
    <CartProvider>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home products={products} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products/:productId" element={<ProductDetail products={products} />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </CartProvider>
  );
}