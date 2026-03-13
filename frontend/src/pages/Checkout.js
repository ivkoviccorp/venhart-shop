import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiMapPin, FiTruck, FiGift } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [giftWrap, setGiftWrap] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    note: '',
  });

  const shippingCost = deliveryMethod === 'delivery' ? 450 : 0;
  const giftWrapCost = giftWrap ? 200 : 0;
  const totalAmount = getTotalPrice() + shippingCost + giftWrapCost;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Vaša korpa je prazna');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        items: cartItems.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.product.images[0]?.url,
        })),
        deliveryMethod,
        shippingAddress: deliveryMethod === 'delivery' ? {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          note: formData.note,
        } : undefined,
        shippingCost: shippingCost + giftWrapCost,
        totalAmount,
        giftWrap,
      };

      const response = await ordersAPI.create(orderData);
      
      toast.success('Porudžbina uspešno poslata! Proverite email.');
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju porudžbine');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-grid">
            {/* Left Side - Form */}
            <div className="checkout-details">
              {/* Contact Info */}
              <div className="form-section">
                <h3>Kontakt informacije</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Ime *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Prezime *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefon *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="form-section">
                <h3>Način preuzimanja</h3>

                <div className="delivery-options">
                  <label className={`delivery-option ${deliveryMethod === 'pickup' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                    />
                    <div className="option-icon">
                      <FiMapPin size={24} />
                    </div>
                    <div className="option-content">
                      <strong>Preuzimanje u butiku</strong>
                      <p className="option-price free">Besplatno</p>
                      <div className="store-address">
                        <p>📍 Generala Ljubomira Milića 1, Beograd 11000</p>
                        <p>🕐 Pon - Sub: 10:00 - 20:00</p>
                        <p>📞 063 755 5245</p>
                      </div>
                    </div>
                  </label>

                  <label className={`delivery-option ${deliveryMethod === 'delivery' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                    />
                    <div className="option-icon">
                      <FiTruck size={24} />
                    </div>
                    <div className="option-content">
                      <strong>Dostava brzom poštom</strong>
                      <p className="option-price">450 RSD</p>
                      <p className="option-note">Isporuka u roku od 2-4 radna dana na teritoriji Srbije</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Shipping Address (if delivery) */}
              {deliveryMethod === 'delivery' && (
                <div className="form-section">
                  <h3>Adresa dostave</h3>

                  <div className="form-group">
                    <label>Ulica i broj *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Grad *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Poštanski broj *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Napomena za dostavu (opciono)</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Dodatne informacije za kurira (sprat, stan, kod za ulaz...)"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Gift Wrap Option */}
              <div className="form-section gift-section">
                <label className={`gift-option ${giftWrap ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                  />
                  <div className="gift-icon">
                    <FiGift size={28} />
                  </div>
                  <div className="gift-content">
                    <strong>Elegantno poklon pakovanje</strong>
                    <p>Vaš artikal će biti pažljivo upakovan u luksuznu poklon kutiju sa satenskom trakom i brendiranom Venhart kesom — savršeno za posebne prilike.</p>
                    <span className="gift-price">+ 200 RSD</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="order-summary">
              <h3>Vaša porudžbina</h3>

              <div className="summary-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="summary-item">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                    />
                    <div className="summary-item-info">
                      <p className="summary-item-name">{item.product.name}</p>
                      <p className="summary-item-details">
                        {item.size} {item.color && `| ${item.color}`} | x{item.quantity}
                      </p>
                    </div>
                    <div className="summary-item-price">
                      {(item.product.price * item.quantity).toLocaleString()} RSD
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Međuzbir:</span>
                  <span>{getTotalPrice().toLocaleString()} RSD</span>
                </div>

                <div className="summary-row">
                  <span>Dostava:</span>
                  <span>{shippingCost === 0 ? 'Besplatno' : `${shippingCost.toLocaleString()} RSD`}</span>
                </div>

                {giftWrap && (
                  <div className="summary-row gift-row">
                    <span>🎁 Poklon pakovanje:</span>
                    <span>{giftWrapCost.toLocaleString()} RSD</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Ukupno:</span>
                  <span>{totalAmount.toLocaleString()} RSD</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-submit-order"
                disabled={loading}
              >
                {loading ? 'Slanje...' : 'Potvrdi porudžbinu'}
              </button>

              <p className="payment-note">
                💳 Plaćanje se vrši prilikom preuzimanja (pouzećem)
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;