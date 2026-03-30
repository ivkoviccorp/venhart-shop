import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('venhartCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('venhartCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, color, quantity = 1) => {
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product._id === product._id &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
      toast.success('Količina ažurirana u korpi');
    } else {
      setCartItems([
        ...cartItems,
        {
          product,
          size,
          color,
          quantity,
        },
      ]);
      toast.success('Proizvod dodat u korpu!');
    }
  };

  const removeFromCart = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    toast.info('Proizvod uklonjen iz korpe');
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = quantity;
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('venhartCart');
  };

  // Broj muških odela u korpi
  const getSuitCount = () => {
    return cartItems.reduce((count, item) => {
      if (item.product.category === 'Muška odela') {
        return count + item.quantity;
      }
      return count;
    }, 0);
  };

  // Broj kravata u korpi
  const getTieCount = () => {
    return cartItems.reduce((count, item) => {
      if (item.product.category === 'Muške kravate i aksesoari') {
        return count + item.quantity;
      }
      return count;
    }, 0);
  };

  // Ukupan broj kravata koje dobijaju popust
  const getDiscountedTieCount = () => {
    const suits = getSuitCount();
    const ties = getTieCount();
    return Math.min(suits, ties);
  };

  // Ukupan iznos popusta na kravate
  const getTieDiscount = () => {
    const discountedTieCount = getDiscountedTieCount();
    const discountPerTie = 2000 * 0.2; // 20% od 2000 = 400
    return discountedTieCount * discountPerTie;
  };

  // Ukupna cena sa popustom
  const getTotalPrice = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    return subtotal - getTieDiscount();
  };

  // Cena bez popusta
  const getSubtotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getSubtotalPrice,
    getTotalItems,
    getSuitCount,
    getTieCount,
    getDiscountedTieCount,
    getTieDiscount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};