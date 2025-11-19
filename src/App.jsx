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

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </CartProvider>
  );
}