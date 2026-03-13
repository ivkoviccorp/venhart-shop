import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiCalendar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const { getTotalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('sr-RS', options));
    };
    
    updateDate();
    // Ažuriraj datum svakog minuta (u slučaju da korisnik ostane na stranici preko ponoći)
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Sakrij Navbar na admin stranicama
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Bar sa datumom */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-date">
            <FiCalendar /> {currentDate}
          </div>
          <div className="top-bar-info">
            <span>📍 Generala Ljubomira Milića 1, Beograd</span>
            <span>📞 063 755 5245</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <h1>VENHART</h1>
            <span>CONCEPT STORE</span>
          </Link>

          {/* Desktop Menu */}
          <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Početna</Link></li>
            <li><Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>O nama</Link></li>
          </ul>

          {/* Icons */}
          <div className="navbar-icons">
            <Link to="/cart" className="cart-icon">
              <FiShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="menu-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;