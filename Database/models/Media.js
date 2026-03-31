const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RepairTicket',
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['before', 'after'],
    required: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
