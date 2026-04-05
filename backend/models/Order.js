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
  promoCode: {
    type: String,
    default: null
  },
  promoDiscount: {
    type: Number,
    default: 0
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

// Generiši UNIKATAN broj porudžbine pre čuvanja
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    this.orderNumber = `VH-${year}${month}${day}-${random}`;
    
    const exists = await mongoose.model('Order').findOne({ orderNumber: this.orderNumber });
    if (exists) {
      const random2 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      this.orderNumber = `VH-${year}${month}${day}-${random2}`;
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);