import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';
import { toast } from 'react-toastify';
import { FiMapPin, FiTruck, FiGift, FiTag } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    getTotalPrice,
    getSubtotalPrice,
    getTieDiscount,
    getDiscountedTieCount,
    clearCart
  } = useCart();
  
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

  const shippingCost = 0;
  const giftWrapCost = giftWrap ? 200 : 0;
  const totalAmount = getTotalPrice() + shippingCost + giftWrapCost;

  useEffect(() => {
    if (cartItems.length > 0) {
      trackBeginCheckout(cartItems, totalAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getDiscountedItemsForOrder = () => {
    let discountedTieCountLeft = getDiscountedTieCount();

    return cartItems.map((item) => {
      const isTie = item.product.category === 'Muške kravate i aksesoari';

      if (isTie && discountedTieCountLeft > 0) {
        const discountedQty = Math.min(item.quantity, discountedTieCountLeft);
        discountedTieCountLeft -= discountedQty;

        const discountedPrice = item.product.price * 0.8;

        return {
          product: item.product._id,
          name: item.product.name,
          price: discountedPrice,
          originalPrice: item.product.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.product.images[0]?.url,
          hasDiscount: true
        };
      }

      return {
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: item.product.images[0]?.url,
        hasDiscount: false
      };
    });
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
        items: getDiscountedItemsForOrder(),
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

      if (response?.data?.order?.orderNumber) {
        trackPurchase(response.data.order.orderNumber, cartItems, totalAmount);
      }
      
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

                {getTieDiscount() > 0 && (
                  <>
                    <div className="summary-discount-note">
                      <FiTag />
                      <span>
                        Akcija: kravata 20% jeftinije uz muško odelo
                        {getDiscountedTieCount() > 0 && ` (${getDiscountedTieCount()} kom)`}
                      </span>
                    </div>

                    <div className="summary-row discount">
                      <span>Popust na kravatu:</span>
                      <span>- {formatPrice(getTieDiscount())}</span>
                    </div>
                  </>
                )}

                {giftWrap && (
                  <div className="summary-row gift-row">
                    <span>🎁 Poklon pakovanje:</span>
                    <span>{formatPrice(giftWrapCost)}</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Ukupno:</span>
                  <span>{formatPrice(totalAmount)}</span>
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