const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
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
  },
  condition_on_arrival: {
    type: String,
    default: "Bình thường"
  }
}, { timestamps: true });

module.exports = mongoose.model('device', deviceSchema);
