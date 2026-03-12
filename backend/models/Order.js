const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customer: {
    firstName: {
      type: String,
      required: [true, 'Ime je obavezno']
    },
    lastName: {
      type: String,
      required: [true, 'Prezime je obavezno']
    },
    email: {
      type: String,
      required: [true, 'Email je obavezan']
    },
    phone: {
      type: String,
      required: [true, 'Telefon je obavezan']
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    size: String,
    color: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String
  }],
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    note: String
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  giftWrap: {
    type: Boolean,
    default: false
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  adminNote: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generiši broj porudžbine pre čuvanja
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `VH-${String(count + 1001).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);