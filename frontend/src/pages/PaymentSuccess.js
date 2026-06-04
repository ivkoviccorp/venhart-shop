import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { trackPurchase } from '../utils/analytics';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  useEffect(() => {
    // Purchase event se pali OVDE i SAMO OVDE za online plaćanje
    if (orderNumber) {
      // Pokušavamo da uzmemo cart iz localStorage pre nego što je obrisan
      const savedCart = localStorage.getItem('lastPurchaseData');
      if (savedCart) {
        try {
          const { cartItems, totalValue } = JSON.parse(savedCart);
          trackPurchase(orderNumber, cartItems, totalValue);
          localStorage.removeItem('lastPurchaseData');
        } catch (e) {
          // Fallback - pali Purchase bez detalja
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: 0,
              currency: 'RSD',
              order_id: orderNumber
            });
          }
          if (window.gtag) {
            window.gtag('event', 'purchase', {
              transaction_id: orderNumber,
              currency: 'RSD',
              value: 0
            });
          }
        }
      } else {
        // Fallback - pali Purchase bez detalja
        if (window.fbq) {
          window.fbq('track', 'Purchase', {
            value: 0,
            currency: 'RSD',
            order_id: orderNumber
          });
        }
        if (window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: orderNumber,
            currency: 'RSD',
            value: 0
          });
        }
      }
    }
  }, [orderNumber]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
      <FiCheckCircle size={80} color="#27ae60" />
      <h1 style={{ marginTop: '20px', color: '#1a1a1a' }}>Plaćanje uspešno!</h1>
      {orderNumber && (
        <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
          Broj porudžbine: <strong>{orderNumber}</strong>
        </p>
      )}
      <p style={{ fontSize: '16px', color: '#666', marginTop: '10px' }}>
        Vaša porudžbina je primljena i plaćanje je uspešno obrađeno.
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        marginTop: '30px',
        padding: '14px 30px',
        background: '#1a1a1a',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Nazad na početnu
      </Link>
    </div>
  );
};

export default PaymentSuccess;