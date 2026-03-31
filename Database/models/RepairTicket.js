const mongoose = require('mongoose');

const repairTicketSchema = new mongoose.Schema({
  ticket_code: {
    type: String,
    required: true,
    unique: true
  },
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  components_used: [{
    component_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'fixing', 'completed', 'canceled'],
    default: 'pending'
  },
  total_cost: {
    type: Number,
    default: 0
  },
  note: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('RepairTicket', repairTicketSchema);
