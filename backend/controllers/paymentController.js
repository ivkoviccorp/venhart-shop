const crypto = require('crypto');
const Order = require('../models/Order');

const CORVUSPAY_STORE_ID = process.env.CORVUSPAY_STORE_ID;
const CORVUSPAY_SECRET_KEY = process.env.CORVUSPAY_SECRET_KEY;
const CORVUSPAY_URL = 'https://wallet.corvuspay.com/checkout/';
const CLIENT_URL = process.env.CLIENT_URL || 'https://venhartstore.rs';

// Generiši CorvusPay HMAC potpis
const generateSignature = (params) => {
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map(key => `${key}${params[key]}`).join('');
  
  return crypto
    .createHmac('sha256', CORVUSPAY_SECRET_KEY)
    .update(signatureString)
    .digest('hex');
};

// @desc    Kreiraj CorvusPay plaćanje
// @route   POST /api/payment/create
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Porudžbina nije pronađena'
      });
    }

    const params = {
      store_id: CORVUSPAY_STORE_ID,
      order_number: order.orderNumber,
      language: 'sr',
      currency: 'RSD',
      amount: order.totalAmount.toFixed(2),
      cart: `Venhart Concept Store - ${order.orderNumber}`,
      require_complete: 'false',
      cardholder_name: `${order.customer.firstName} ${order.customer.lastName}`,
      cardholder_email: order.customer.email,
      success_url: `${CLIENT_URL}/payment/success?order=${order.orderNumber}`,
      cancel_url: `${CLIENT_URL}/payment/cancel?order=${order.orderNumber}`,
    };

    const signature = generateSignature(params);

    res.json({
      success: true,
      paymentUrl: CORVUSPAY_URL,
      params: {
        ...params,
        signature
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    CorvusPay callback - uspešno plaćanje
// @route   POST /api/payment/callback
exports.paymentCallback = async (req, res) => {
  try {
    console.log('CorvusPay callback:', req.body);

    const { order_number, approval_code, language, amount, currency, signature } = req.body;

    const order = await Order.findOne({ orderNumber: order_number });

    if (order) {
      order.status = 'accepted';
      order.adminNote = `Online plaćanje karticom - Approval: ${approval_code || 'N/A'}`;
      await order.save();
      console.log(`Porudžbina ${order_number} plaćena online`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Error');
  }
};