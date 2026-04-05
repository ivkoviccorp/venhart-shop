const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email je obavezan'],
    unique: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);