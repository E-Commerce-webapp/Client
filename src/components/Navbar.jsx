import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import SearchBar from "./SearchBar";
import { isTokenValid } from "../utils/auth";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { cartCount } = useCart();
  const token = localStorage.getItem("token");
  const loggedIn = token && isTokenValid(token);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!loggedIn) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsSeller(response.data.isASeller || false);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSellerStatus();
  }, [loggedIn, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const closeUserMenu = () => setShowUserMenu(false);

  const getUserName = () => {
    if (!token) return 'Account';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || 'Account';
    } catch (_) {
      return 'Account';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/">
          EcomSphere
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="d-none d-lg-block me-3 flex-grow-1 mx-4">
            <SearchBar />
          </div>

          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 
                  ${isActive ? "active fw-bold text-info" : "text-light"}`
                }
              >
                <i className="bi bi-house-door fs-5"></i>
                <span className="d-none d-md-inline">Home</span>
              </NavLink>
            </li>

            {loggedIn && !isLoading && (
              <li className="nav-item">
                {isSeller ? (
                  <NavLink
                    to="/seller"
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-2 
                      ${isActive ? "active fw-bold text-info" : "text-light"}`
                    }
                  >
                    <i className="bi bi-shop fs-5"></i>
                    <span className="d-none d-md-inline">Seller Hub</span>
                  </NavLink>
                ) : (
                  <NavLink
                    to="/become-seller"
                    className="nav-link d-flex align-items-center gap-2 text-light"
                  >
                    <i className="bi bi-shop fs-5"></i>
                    <span className="d-none d-md-inline">Become a Seller</span>
                  </NavLink>
                )}
              </li>
            )}

            {/* Notifications */}
            {loggedIn && (
              <li className="nav-item me-2">
                <NotificationDropdown />
              </li>
            )}

            {/* User Account Dropdown */}
            <li className="nav-item dropdown" onMouseLeave={closeUserMenu}>
              <div className="d-flex align-items-center">
                <button
                  className="nav-link d-flex align-items-center gap-2 text-light bg-transparent border-0"
                  onClick={toggleUserMenu}
                  aria-expanded={showUserMenu}
                >
                  <i className="bi bi-person-circle fs-4"></i>
                  <span className="d-none d-md-inline">{getUserName()}</span>
                  <i className={`bi bi-chevron-${showUserMenu ? 'up' : 'down'} ms-1`}></i>
                </button>
              </div>
              
              <div className={`dropdown-menu dropdown-menu-end ${showUserMenu ? 'show' : ''}`}>
                {loggedIn ? (
                  <>
                    <NavLink 
                      to="/profile" 
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={closeUserMenu}
                    >
                      <i className="bi bi-person"></i> My Profile
                    </NavLink>
                    <NavLink 
                      to="/orders" 
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={closeUserMenu}
                    >
                      <i className="bi bi-box-seam"></i> My Orders
                    </NavLink>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item d-flex align-items-center gap-2 text-danger"
                      onClick={() => {
                        closeUserMenu();
                        handleLogout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink 
                      to="/login" 
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={closeUserMenu}
                    >
                      <i className="bi bi-box-arrow-in-right"></i> Login
                    </NavLink>
                    <NavLink 
                      to="/register" 
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={closeUserMenu}
                    >
                      <i className="bi bi-person-plus"></i> Register
                    </NavLink>
                  </>
                )}
              </div>
            </li>

            {/* Cart Icon */}
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 position-relative 
                  ${isActive ? "active fw-bold text-info" : "text-light"}`
                }
              >
                <i className="bi bi-cart3 fs-5"></i>
                <span className="d-none d-md-inline">Cart</span>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-fluid d-lg-none mt-2">
        <div className="px-2">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}