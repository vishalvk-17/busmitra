import { Link, NavLink } from "react-router-dom";
import { FaBusAlt, FaDownload } from "react-icons/fa";
import authService from "../../../services/authService";
import "./Navbar.css";

export default function Navbar() {
  const isLoggedIn = Boolean(authService.getToken());

  return (
    <header className="navbar">
      <div className="container navbar-container">

        {/* Logo */}

        <Link to="/" className="logo">

          <div className="logo-icon">
            <FaBusAlt />
          </div>

          <div className="logo-text">
            <span className="black">Bus</span>
            <span className="blue"> Mitra</span>
          </div>

        </Link>

        {/* Navigation */}

        <nav className="nav-links">

          <NavLink to="/">Home</NavLink>

          <NavLink to="/track-bus">
            Track Bus
          </NavLink>

          <NavLink to="/routes">
            Routes
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/favorites">
              Favorites
            </NavLink>
          )}

          <NavLink to="/about">
            About Us
          </NavLink>

          <NavLink to="/contact">
            Contact
          </NavLink>

        </nav>

        <div className="portal-links">
          <Link to="/driver/login">Driver</Link>
          <Link to="/operator/login">Bus Owner</Link>
          <Link to="/admin/login">Admin</Link>
        </div>

        {/* Download Button */}

        <Link
          to={isLoggedIn ? "/dashboard" : "/login"}
          className="download-btn"
        >

          <FaDownload />

          <span>
            {isLoggedIn ? "My Dashboard" : "Login"}
          </span>

        </Link>

      </div>
    </header>
  );
}
