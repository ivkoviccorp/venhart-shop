import React from 'react';
import { FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaCheckCircle, FaStar, FaHeart } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>VENHART</h1>
          <p className="about-subtitle">CONCEPT STORE</p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content">
        <div className="container">
          <div className="about-text">
            <h2>Naša priča</h2>
            <p>
              Venhart Concept Store je moderan butik muške i ženske garderobe koji nudi pažljivo birane komade sa fokusom na kvalitet, eleganciju i savremen stil.
            </p>
            <p>
              Naša ponuda obuhvata košulje, pantalone, farmerke, komplekte i druge modne artikle namenjene osobama koje cene sofisticiran izgled i udobnost u svakodnevnim i posebnim prilikama.
            </p>
            <p>
              U Venhart Concept Store-u spajamo moderan dizajn, kvalitetne materijale i preciznu izradu, stvarajući garderobu koja ističe samopouzdanje i lični stil.
            </p>
            <p>
              Posvećeni smo detaljima, profesionalnoj usluzi i autentičnom modnom identitetu.
            </p>
          </div>

          <div className="about-features">
            <div className="feature">
              <div className="feature-icon">
                <FaStar />
              </div>
              <h3>Kvalitet</h3>
              <p>Samo najbolji materijali i precizna izrada</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaCheckCircle />
              </div>
              <h3>Elegancija</h3>
              <p>Sofisticiran izgled za svaku priliku</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaHeart />
              </div>
              <h3>Posvećenost</h3>
              <p>Profesionalna usluga i pažnja na detalje</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact">
        <div className="container">
          <h2>Kontaktirajte nas</h2>

          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <h4>Adresa</h4>
              <p>Generala Ljubomira Milića 1</p>
              <p>Beograd 11000</p>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <h4>Telefon</h4>
              <a href="tel:+381637555245">063 755 5245</a>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <h4>Email</h4>
              <a href="mailto:venhartconceptstore@gmail.com">venhartconceptstore@gmail.com</a>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaInstagram />
              </div>
              <h4>Instagram</h4>
              <a href="https://www.instagram.com/venhart.store/" target="_blank" rel="noopener noreferrer">
                @venhart.store
              </a>
            </div>
          </div>

          <div className="working-hours">
            <div className="hours-icon">
              <FaClock />
            </div>
            <h3>Radno vreme</h3>
            <div className="hours-grid">
              <p><strong>Ponedeljak - Subota:</strong> 10:00 - 20:00</p>
              <p><strong>Nedelja:</strong> Zatvoreno</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;