import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  // Sakrij Footer na admin stranicama
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3>VENHART</h3>
          <p className="footer-tagline">CONCEPT STORE</p>
          <p>Elegancija. Stil. Kvalitet.</p>
        </div>

        <div className="footer-section">
          <h4>Kontakt</h4>
          <ul className="footer-contact">
            <li>
              <FaMapMarkerAlt /> Generala Ljubomira Milića 1, Beograd 11000
            </li>
            <li>
              <FaPhone /> <a href="tel:+381637555245">063 755 5245</a>
            </li>
            <li>
              <FaEnvelope /> <a href="mailto:venhartconceptstore@gmail.com">venhartconceptstore@gmail.com</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Radno vreme</h4>
          <p>Ponedeljak - Subota: 10:00 - 20:00</p>
          <p>Nedelja: Zatvoreno</p>
        </div>

        <div className="footer-section">
          <h4>Pratite nas</h4>
          <div className="footer-social">
            <a href="https://www.instagram.com/venhart.store/" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={28} />
            </a>
          </div>
          <div className="footer-links">
            <Link to="/shop">Shop</Link>
            <Link to="/about">O nama</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Developed by <strong>ivkovickorp</strong>. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;