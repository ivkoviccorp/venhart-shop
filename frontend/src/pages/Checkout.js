import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI, paymentAPI } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { trackBeginCheckout } from '../utils/analytics';
import { toast } from 'react-toastify';
import { FiMapPin, FiTruck, FiGift, FiCreditCard } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    getTotalPrice,
    getSubtotalPrice,
    clearCart
  } = useCart();
  
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cash');
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

  const shippingCost = 0;
  const giftWrapCost = giftWrap ? 200 : 0;

  const finalTotal = getTotalPrice() + shippingCost + giftWrapCost;

  useEffect(() => {
    if (cartItems.length > 0) {
      trackBeginCheckout(cartItems, finalTotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getItemsForOrder = () => {
    return cartItems.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      image: item.product.images[0]?.url,
    }));
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
        items: getItemsForOrder(),
        deliveryMethod,
        paymentMethod,
        shippingAddress: deliveryMethod === 'delivery' ? {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          note: formData.note,
        } : undefined,
        shippingCost: shippingCost + giftWrapCost,
        totalAmount: finalTotal,
        giftWrap,
      };

      const response = await ordersAPI.create(orderData);

      if (paymentMethod === 'card' && response?.data?.order?._id) {
        try {
          const paymentResponse = await paymentAPI.createPayment(response.data.order._id);
          
          if (paymentResponse?.data?.success) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = paymentResponse.data.paymentUrl;

            Object.entries(paymentResponse.data.params).forEach(([key, value]) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });

            localStorage.setItem('lastPurchaseData', JSON.stringify({
              cartItems: cartItems,
              totalValue: finalTotal,
              orderNumber: response.data.order.orderNumber
            }));

            document.body.appendChild(form);
            clearCart();
            form.submit();
            return;
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          toast.error('Greška pri pokretanju online plaćanja');
        }
      }
      
      const orderNumber = response?.data?.order?.orderNumber;

      localStorage.setItem('lastPurchaseData', JSON.stringify({
        cartItems: cartItems,
        totalValue: finalTotal,
        orderNumber: orderNumber
      }));

      toast.success('Porudžbina uspešno poslata! Proverite email.');
      clearCart();
      
      setTimeout(() => {
        navigate(`/order-confirmation?order=${orderNumber}`);
      }, 1000);
      
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
            <div className="checkout-details">
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
                      <p className="option-note">Isporuka u roku od 2-4 radna dana na teritoriji Srbije</p>
                    </div>
                  </label>
                </div>
              </div>

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

              <div className="form-section">
                <h3>Način plaćanja</h3>

                <div className="delivery-options">
                  <label className={`delivery-option ${paymentMethod === 'cash' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="option-icon">
                      <FiCreditCard size={24} />
                    </div>
                    <div className="option-content">
                      <strong>Plaćanje pouzećem</strong>
                      <p className="option-note">Plaćanje prilikom preuzimanja porudžbine</p>
                    </div>
                  </label>

                  <label className={`delivery-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="option-icon">
                      <FiCreditCard size={24} />
                    </div>
                    <div className="option-content">
                      <strong>Plaćanje karticom online</strong>
                      <p className="option-note">Sigurno plaćanje putem Visa, Mastercard, Maestro ili Dina kartice</p>
                      <div className="payment-methods-inline">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>Maestro</span>
                        <span>Dina</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

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
                    <p>Vaš artikal će biti pažljivo upakovan sa satenskom trakom i ukrasnom poklon kesom — savršeno za posebne prilike.</p>
                    <span className="gift-price">+ 200,00 RSD</span>
                  </div>
                </label>
              </div>
            </div>

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
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Međuzbir:</span>
                  <span>{formatPrice(getSubtotalPrice())}</span>
                </div>

                {giftWrap && (
                  <div className="summary-row gift-row">
                    <span>🎁 Poklon pakovanje:</span>
                    <span>{formatPrice(giftWrapCost)}</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Ukupno:</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-submit-order"
                disabled={loading}
              >
                {loading ? 'Obrada...' : (paymentMethod === 'card' ? 'Plati karticom' : 'Potvrdi porudžbinu')}
              </button>

              <p className="payment-note">
                {paymentMethod === 'card' 
                  ? '🔒 Sigurno online plaćanje putem CorvusPay sistema'
                  : '💳 Plaćanje se vrši prilikom preuzimanja (pouzećem)'
                }
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;