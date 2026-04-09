const express = require('express');
const router = express.Router();
const {
  createPayment,
  paymentCallback
} = require('../controllers/paymentController');

// Kreiraj plaćanje (frontend poziva ovo)
router.post('/create', createPayment);

// CorvusPay callback (CorvusPay poziva ovo)
router.post('/callback', paymentCallback);

module.exports = router;