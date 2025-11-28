import { NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { cartCount } = useCart();
  const token = localStorage.getItem("token");
  const loggedIn = !!token;
  const accountLink = loggedIn ? "/profile" : "/login";
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
          {/* Searchbar on medium and larger screens */}
          <div className="d-none d-lg-block me-3 flex-grow-1 mx-4">
            <SearchBar />
          </div>
          
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 
                  ${isActive ? 'active fw-bold text-info' : 'text-light'}`
                }
              >
                <i className="bi bi-house-door fs-5"></i>
                <span>Home</span>
              </NavLink>
            </li>
            {loggedIn && (
              <li className="nav-item">
                <NavLink
                  to="/sell"
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-2 
                    ${isActive ? 'active fw-bold text-info' : 'text-light'}`
                  }
                >
                  <i className="bi bi-plus-circle fs-5"></i>
                  <span>Sell</span>
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink
                to={accountLink}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 
                  ${isActive ? 'active fw-bold text-info' : 'text-light'}`
                }
              >
                {loggedIn ? (<i className="bi bi-person-fill fs-5"></i>) : (<i className="bi bi-person fs-5"></i>)}
                <span>{loggedIn ? 'Account' : 'Login'}</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `nav-link position-relative d-flex align-items-center gap-2 
                  ${isActive ? 'active fw-bold text-info' : 'text-light'}`
                }
              >
                <div className="position-relative">
                  <i className="bi bi-cart3 fs-5"></i>
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      {cartCount > 9 ? '9+' : cartCount}
                      <span className="visually-hidden">items in cart</span>
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Search Bar when toggled */}
      <div className="container-fluid d-lg-none mt-2">
        <div className="px-2">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}