let mongoose = require('mongoose');

let mediaSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'repairTicket',
      required: [true, 'Phiếu sửa chữa là bắt buộc'],
    },
    url: {
      type: String,
      required: [true, 'URL ảnh là bắt buộc'],
    },
    type: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model('media', mediaSchema);
