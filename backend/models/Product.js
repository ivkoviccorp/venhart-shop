const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Naziv proizvoda je obavezan'],
    trim: true
  },
  description: {
    type: String,
    default: ''
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
      'Muški sakoi',
      'Muški džemperi',
      'Muške košulje i natkošulje',
      'Muške farmerke',
      'Muške pantalone',
      'Muške bermude',
      'Muške majice',
      'Ženska odela',
      'Ženski sakoi',
      'Ženske haljine i kompleti',
      'Ženski triko komplet',
      'Ženske pantalone',
      'Bluze',
      'Suknje',
      'Jakne i kaputi',
      'Muške kravate i aksesoari',
      'Čarape',
      'Cipele',
      'Torbe',
      'Ostalo'
    ]
  },
  sizes: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size', '30', '31', '32', '33', '34', '36', '38', '39', '40', '41', '42', '43', '44', '45', '46', '48', '50', '52', '54', '56', '58', '60', '62']
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
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