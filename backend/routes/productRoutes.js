const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getAllProductsAdmin
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Javne rute
router.get('/', getProducts);

// Admin rute
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id/image', protect, adminOnly, deleteProductImage);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Mora da bude na kraju
router.get('/:id', getProduct);

module.exports = router;