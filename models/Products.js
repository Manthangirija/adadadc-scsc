const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
  email: {
    type: String,
    // required: true
  },
  productName: {
    type: String,
    required: true
  },
  productAmount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Products = mongoose.model('Products', productsSchema);

module.exports = Products;
