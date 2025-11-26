
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true, maxlength: 200 },
  fullDescription: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Trouser', 'Full Shirt', 'Jacket', 'Sweater', 'Blazer', 'Coat', 'Accessories']
  },
  sizes: [{ type: String, required: true }], 
  colors: [{
    name: { type: String, required: true },
    hexCode: { type: String, default: null }
  }],
  images: [{ type: String, required: true }],
  stock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);