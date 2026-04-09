const crypto = require('crypto');
const Order = require('../models/Order');

const CORVUSPAY_STORE_ID = process.env.CORVUSPAY_STORE_ID;
const CORVUSPAY_SECRET_KEY = process.env.CORVUSPAY_SECRET_KEY;
const CORVUSPAY_URL = 'https://wallet.corvuspay.com/checkout/';
const CLIENT_URL = process.env.CLIENT_URL || 'https://venhartstore.rs';

// Generiši CorvusPay HMAC SHA256 potpis
const generateSignature = (orderNumber, storeId, amount, currency) => {
  const message = `${orderNumber}${storeId}${amount}${currency}`;

  return crypto
    .createHmac('sha256', CORVUSPAY_SECRET_KEY)
    .update(message)
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

    const amount = order.totalAmount.toFixed(2);
    const currency = 'RSD';
    const orderNumber = order.orderNumber;

    const signature = generateSignature(orderNumber, CORVUSPAY_STORE_ID, amount, currency);

    const params = {
      version: '1.3',
      store_id: CORVUSPAY_STORE_ID,
      order_number: orderNumber,
      language: 'sr',
      currency: currency,
      amount: amount,
      cart: `Venhart Concept Store - ${orderNumber}`,
      require_complete: 'false',
      signature: signature,
      success_url: `${CLIENT_URL}/payment/success?order=${orderNumber}`,
      cancel_url: `${CLIENT_URL}/payment/cancel?order=${orderNumber}`,
    };

    console.log('CorvusPay params:', params);

    res.json({
      success: true,
      paymentUrl: CORVUSPAY_URL,
      params
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

    const { order_number, approval_code } = req.body;

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