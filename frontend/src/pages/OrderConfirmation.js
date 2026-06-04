import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { trackPurchase } from '../utils/analytics';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  useEffect(() => {
    if (orderNumber) {
      const savedPurchaseData = localStorage.getItem('lastPurchaseData');

      if (savedPurchaseData) {
        try {
          const parsed = JSON.parse(savedPurchaseData);

          if (parsed.orderNumber === orderNumber) {
            trackPurchase(orderNumber, parsed.cartItems, parsed.totalValue);
            localStorage.removeItem('lastPurchaseData');
          }
        } catch (error) {
          console.error('Greška pri čitanju purchase podataka:', error);
        }
      }
    }
  }, [orderNumber]);

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
      <FiCheckCircle size={80} color="#27ae60" />
      <h1 style={{ marginTop: '20px', color: '#1a1a1a' }}>Porudžbina uspešno poslata!</h1>

      {orderNumber && (
        <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
          Broj porudžbine: <strong>{orderNumber}</strong>
        </p>
      )}

      <p style={{ fontSize: '16px', color: '#666', marginTop: '10px', maxWidth: '700px', marginInline: 'auto' }}>
        Hvala na poverenju. Vaša porudžbina je uspešno evidentirana i naš tim će je uskoro obraditi.
      </p>

      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '30px',
          padding: '14px 30px',
          background: '#1a1a1a',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600'
        }}
      >
        Nazad na početnu
      </Link>
    </div>
  );
};

export default OrderConfirmation;