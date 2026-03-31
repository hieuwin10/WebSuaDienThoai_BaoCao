const mongoose = require('mongoose');

const repairTicketSchema = new mongoose.Schema({
  ticket_code: {
    type: String,
    required: true,
    unique: true
  },
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'service'
  }],
  components_used: [{
    component_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'component'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'fixing', 'completed', 'canceled', 'ready_for_pickup'],
    default: 'pending'
  },
  technician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  total_cost: {
    type: Number,
    default: 0
  },
  note: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('repairTicket', repairTicketSchema);
