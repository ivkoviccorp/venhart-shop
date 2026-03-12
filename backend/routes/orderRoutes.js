const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  trackOrder,
  getDashboardStats,
  deleteOrder,
  deleteAllOrders
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Javne rute
router.post('/', createOrder);
router.get('/track/:orderNumber', trackOrder);

// Admin rute
router.get('/', protect, adminOnly, getOrders);
router.get('/admin/stats', protect, adminOnly, getDashboardStats);
router.get('/:id', protect, adminOnly, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);
router.delete('/admin/reset-all', protect, adminOnly, deleteAllOrders);

module.exports = router;