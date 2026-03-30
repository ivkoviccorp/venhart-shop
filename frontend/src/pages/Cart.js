import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiShoppingBag, FiTag } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getSubtotalPrice,
    getTotalItems,
    getTieDiscount,
    getDiscountedTieCount
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <FiShoppingBag size={80} />
        <h2>Vaša korpa je prazna</h2>
        <p>Dodajte proizvode u korpu da biste nastavili sa kupovinom.</p>
        <Link to="/shop" className="btn">
          Nazad na Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1 className="page-title">Korpa ({getTotalItems()})</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <img
                  src={item.product.images[0]?.url || '/placeholder.jpg'}
                  alt={item.product.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-meta">
                    Veličina: <strong>{item.size}</strong>
                    {item.color && (
                      <> | Boja: <strong>{item.color}</strong></>
                    )}
                  </p>
                  <p className="cart-item-price">
                    {item.product.price.toLocaleString()} RSD
                  </p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, item.quantity + 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(index)}
                  >
                    <FiTrash2 /> Ukloni
                  </button>
                </div>

                <div className="cart-item-total">
                  {(item.product.price * item.quantity).toLocaleString()} RSD
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h3>Rezime porudžbine</h3>

            <div className="summary-row">
              <span>Ukupno proizvoda:</span>
              <span>{getTotalItems()}</span>
            </div>

            <div className="summary-row">
              <span>Međuzbir:</span>
              <span>{getSubtotalPrice().toLocaleString()} RSD</span>
            </div>

            {getTieDiscount() > 0 && (
              <>
                <div className="cart-discount-info">
                  <FiTag />
                  <span>
                    Akcija: uz muško odelo kravata je 20% jeftinija
                    {getDiscountedTieCount() > 0 && ` (${getDiscountedTieCount()} kom)`}
                  </span>
                </div>

                <div className="summary-row discount">
                  <span>Popust na kravatu:</span>
                  <span>- {getTieDiscount().toLocaleString()} RSD</span>
                </div>
              </>
            )}

            <div className="summary-row total">
              <span>Ukupno:</span>
              <span>{getTotalPrice().toLocaleString()} RSD</span>
            </div>

            <button
              className="btn btn-checkout"
              onClick={() => navigate('/checkout')}
            >
              Nastavi ka plaćanju
            </button>

            <Link to="/shop" className="continue-shopping">
              ← Nastavi kupovinu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;