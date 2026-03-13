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
      'Muška odela',
      'Muške košulje i natkošulje',
      'Muške farmerke',
      'Muške pantalone',
      'Ženska odela',
      'Ženski kompleti',
      'Haljine',
      'Bluze',
      'Suknje',
      'Ženske pantalone',
      'Jakne i kaputi',
      'Aksesoari',
      'Cipele',
      'Torbe',
      'Ostalo'
    ]
  },
    sizes: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size', '30', '32', '33', '34', '36', '38', '39', '40', '41', '42', '43', '44', '45', '46', '48', '50', '52', '54', '56']
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
  gender: {
    type: String,
    enum: ['Muški', 'Ženski', 'Unisex'],
    default: 'Unisex'
  },
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