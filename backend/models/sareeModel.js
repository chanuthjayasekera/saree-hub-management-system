const mongoose = require('mongoose');

const sareeSchema = new mongoose.Schema(
  {
    photos: {
      type: [String], 
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    dimensions: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    blouseLength: {
      type: String,
      required: true,
    },
    marketedBy: {
      type: String,
      required: true,
    },
    price: {
      type: Number, 
      required: true,
      min: 0, 
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Saree = mongoose.model('Saree', sareeSchema);

module.exports = Saree;
