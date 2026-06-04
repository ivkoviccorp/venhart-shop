// ========================
// GOOGLE ANALYTICS + META PIXEL
// Unified Analytics
// ========================

// Helper za GA4
const trackGA4Event = (eventName, params = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Helper za Meta Pixel
const trackMetaEvent = (eventName, params = {}) => {
  if (window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Generisanje jedinstvenog event ID za deduplication
const generateEventId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ========================
// PAGE VIEW
// ========================
export const trackPageView = () => {
  trackGA4Event('page_view');
  // Meta PageView se automatski pali u index.html
};

// ========================
// VIEW CONTENT - Pregled proizvoda
// ========================
export const trackViewContent = (product) => {
  // GA4
  trackGA4Event('view_item', {
    currency: 'RSD',
    value: product.price,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity: 1
    }]
  });

  // Meta Pixel
  trackMetaEvent('ViewContent', {
    content_ids: [product._id],
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: product.price,
    currency: 'RSD'
  });
};

// ========================
// ADD TO CART - Dodavanje u korpu
// ========================
export const trackAddToCart = (product, quantity = 1) => {
  // GA4
  trackGA4Event('add_to_cart', {
    currency: 'RSD',
    value: product.price * quantity,
    items: [{
      item_id: product._id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity
    }]
  });

  // Meta Pixel
  trackMetaEvent('AddToCart', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'RSD'
  });
};

// ========================
// BEGIN CHECKOUT - Početak checkout-a
// ========================
export const trackBeginCheckout = (cartItems, totalValue) => {
  const items = cartItems.map((item) => ({
    item_id: item.product._id,
    item_name: item.product.name,
    item_category: item.product.category,
    price: item.product.price,
    quantity: item.quantity
  }));

  // GA4
  trackGA4Event('begin_checkout', {
    currency: 'RSD',
    value: totalValue,
    items
  });

  // Meta Pixel
  trackMetaEvent('InitiateCheckout', {
    content_ids: cartItems.map(item => item.product._id),
    num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    value: totalValue,
    currency: 'RSD'
  });
};

// ========================
// PURCHASE - Uspešna kupovina
// PALI SE SAMO NA THANK YOU / SUCCESS STRANICI
// ========================
export const trackPurchase = (orderNumber, cartItems, totalValue) => {
  const eventId = generateEventId();

  const items = cartItems.map((item) => ({
    item_id: item.product._id,
    item_name: item.product.name,
    item_category: item.product.category,
    price: item.product.price,
    quantity: item.quantity
  }));

  // GA4
  trackGA4Event('purchase', {
    transaction_id: orderNumber,
    currency: 'RSD',
    value: totalValue,
    items
  });

  // Meta Pixel Purchase
  trackMetaEvent('Purchase', {
    content_ids: cartItems.map(item => item.product._id),
    content_type: 'product',
    value: totalValue,
    currency: 'RSD',
    order_id: orderNumber,
    eventID: eventId
  });

  console.log('✅ Purchase event fired - Order:', orderNumber, 'Value:', totalValue);
};