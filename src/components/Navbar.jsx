import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar() {
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
                  "nav-link" + (isActive ? " active fw-bold text-info" : "")
                }
              >
                <i className="bi bi-house-door"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active fw-bold text-info" : "")
                }
              >
                <i className="bi bi-box-arrow-in-right"></i> Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active fw-bold text-info" : "")
                }
              >
                <i className="bi bi-cart"></i> Cart
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