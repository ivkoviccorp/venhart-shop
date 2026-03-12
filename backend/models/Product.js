const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Naziv proizvoda je obavezan'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Opis proizvoda je obavezan']
  },
  price: {
    type: Number,
    required: [true, 'Cena je obavezna'],
    min: 0
  },
  oldPrice: {
    type: Number,
    default: null
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: [true, 'Kategorija je obavezna'],
    enum: [
      'Haljine',
      'Bluze',
      'Pantalone',
      'Suknje',
      'Jakne',
      'Aksesoari',
      'Cipele',
      'Torbe',
      'Ostalo'
    ]
  },
  sizes: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
    },
    inStock: {
      type: Boolean,
      default: true
    }
  }],
  colors: [{
    name: String,
    hex: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  onSale: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);