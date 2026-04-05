const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  getSubscribers,
  deleteSubscriber
} = require('../controllers/newsletterController');

// Ako kasnije želiš možeš dodati admin zaštitu na get/delete
router.post('/', subscribeNewsletter);
router.get('/', getSubscribers);
router.delete('/:id', deleteSubscriber);

module.exports = router;