export const trackEvent = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackAddToCart = (product, quantity = 1) => {
  trackEvent('add_to_cart', {
    currency: 'RSD',
    value: product.price * quantity,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity
      }
    ]
  });
};

export const trackBeginCheckout = (cartItems, totalValue) => {
  trackEvent('begin_checkout', {
    currency: 'RSD',
    value: totalValue,
    items: cartItems.map((item) => ({
      item_id: item.product._id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity
    }))
  });
};

export const trackPurchase = (orderNumber, cartItems, totalValue) => {
  trackEvent('purchase', {
    transaction_id: orderNumber,
    currency: 'RSD',
    value: totalValue,
    items: cartItems.map((item) => ({
      item_id: item.product._id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity
    }))
  });
};