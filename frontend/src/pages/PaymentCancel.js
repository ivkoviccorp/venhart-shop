import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
      <FiXCircle size={80} color="#e74c3c" />
      <h1 style={{ marginTop: '20px', color: '#1a1a1a' }}>Plaćanje otkazano</h1>
      {orderNumber && (
        <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
          Porudžbina: <strong>{orderNumber}</strong>
        </p>
      )}
      <p style={{ fontSize: '16px', color: '#666', marginTop: '10px' }}>
        Plaćanje nije završeno. Vaša porudžbina ostaje na čekanju.
      </p>
      <Link to="/shop" style={{
        display: 'inline-block',
        marginTop: '30px',
        padding: '14px 30px',
        background: '#1a1a1a',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Nazad u shop
      </Link>
    </div>
  );
};

export default PaymentCancel;