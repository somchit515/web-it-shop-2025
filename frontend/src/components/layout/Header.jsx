// src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../redux/api/userApi";
import { useLogoutMutation } from "../redux/authApi";
import Search from "./Search";
import PushNotificationToggle from "../notifications/PushNotificationToggle";
import "./Header.css";

const navItems = [
  { label: "Home", path: "/", icon: "fas fa-home" },
  { label: "Recommended", path: "/recommended", icon: "fas fa-star" },
  { label: "Blog", path: "/blogs", icon: "fas fa-blog" },
  { label: "About", path: "/about", icon: "fas fa-info-circle" },
  { label: "Contact", path: "/contact", icon: "fas fa-envelope" },
];

export default function Header() {
  const navigate = useNavigate();
  const { isLoading } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart?.cartItems || []);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutHandle = async () => {
    try {
      await logout().unwrap();
      navigate("/login");
    } catch {
      window.location.reload();
    }
  };

  const toggleDropdown = () => setDropdownOpen((v) => !v);

  return (
    <>
      <header className={`modern-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-fullwidth">
          <div className="header-row">
            {/* Logo */}
            <div className="logo-section">
              <Link to="/" className="logo-link" aria-label="Go to homepage">
                <img src="/images/logo.png" alt="IT HUBB Logo" className="logo-img" />
              </Link>
            </div>

            {/* Desktop Navigation + Search (full-width) */}
            <div className="nav-search-full">
              <nav className="desktop-nav" aria-label="Main navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <i className={item.icon} aria-hidden="true"></i>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Search on top bar */}
              <div className="top-search">
                <Search />
              </div>
            </div>

            {/* Actions */}
            <div className="actions-section">
              {/* Mobile Menu Button */}
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open mobile menu"
              >
                <i className="fas fa-bars"></i>
              </button>

              {/* Cart */}
              <NavLink to="/cart" className="cart-link" aria-label={`Cart (${cartItems.length} items)`}>
                <svg className="cart-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="cart-badge" aria-live="polite">
                    {cartItems.length}
                  </span>
                )}
              </NavLink>

              {/* User Menu with Dropdown */}
              {user ? (
                <div className="user-menu" ref={dropdownRef}>
                  <button
                    className="user-menu-btn"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <img
                      src={user?.avatar?.url || "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"}
                      alt={`${user?.name || "User"} avatar`}
                      className="user-avatar"
                    />
                    <span className="user-name">{user?.name || "User"}</span>
                    <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}>▼</span>
                  </button>

                  {dropdownOpen && (
                    <div className="custom-dropdown">
                      {(user?.role === "admin" || user?.role === "superAdmin") && (
                        <Link to="/admin/dashboard" className="custom-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <i className="fas fa-shield-alt"></i>
                          <span>Dashboard</span>
                          <span className={`role-badge ${user?.role === 'superAdmin' ? 'role-superadmin' : 'role-admin'}`}>
                            {user?.role === 'superAdmin' ? 'SA' : 'Admin'}
                          </span>
                        </Link>
                      )}
                      <Link to="/me/orders" className="custom-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-shopping-bag"></i>
                        <span>ຄໍາສັ່ງຊື້ຂອງຂ້ອຍ</span>
                      </Link>
                      <Link to="/me/profile" className="custom-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-user-circle"></i>
                        <span>ໂປຣໄຟລ໌</span>
                      </Link>
                      <PushNotificationToggle />
                      <div className="custom-dropdown-divider"></div>
                      <button
                        className="custom-dropdown-item text-danger"
                        onClick={() => {
                          setDropdownOpen(false);
                          logoutHandle();
                        }}
                        disabled={isLoggingOut}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>{isLoggingOut ? "ກຳລັງອອກ..." : "ອອກຈາກລະບົບ"}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !isLoading && (
                  <Link to="/login" className="btn-login" aria-label="Sign in">
                    <i className="fas fa-sign-in-alt"></i>
                    <span>ເຂົ້າລະບົບ</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-header">
            <img src="/images/logo.png" alt="IT HUBB" style={{ height: 40 }} />
            <button
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <nav className="mobile-menu-nav" aria-label="Mobile navigation">
            {/* Main nav items */}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="mobile-menu-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* User section (if logged in) */}
            {user && (
              <>
                {(user?.role === "admin" || user?.role === "superAdmin") && (
                  <NavLink to="/admin/dashboard" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fas fa-shield-alt"></i>
                    <span>Dashboard</span>
                  </NavLink>
                )}
                <NavLink to="/me/orders" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fas fa-shopping-bag"></i>
                  <span>ຄໍາສັ່ງຊື້ຂອງຂ້ອຍ</span>
                </NavLink>
                <NavLink to="/me/profile" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fas fa-user-circle"></i>
                  <span>ໂປຣໄຟລ໌</span>
                </NavLink>
                <button
                  className="mobile-menu-item text-danger"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutHandle();
                  }}
                  disabled={isLoggingOut}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{isLoggingOut ? "ກຳລັງອອກ..." : "ອອກຈາກລະບົບ"}</span>
                </button>
              </>
            )}

            {/* Guest menu (if not logged in) */}
            {!user && (
              <Link to="/login" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
                <i className="fas fa-sign-in-alt"></i>
                <span>ເຂົ້າລະບົບ</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}