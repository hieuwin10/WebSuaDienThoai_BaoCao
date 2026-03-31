const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  base_price: {
    type: Number,
    required: true,
    min: 0
  },
  estimated_time: {
    type: String,
    default: "30-60 phút"
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
