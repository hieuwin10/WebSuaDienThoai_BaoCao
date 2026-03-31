const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model_name: {
    type: String,
    required: true
  },
  imei: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
