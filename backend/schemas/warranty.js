let mongoose = require('mongoose');

let warrantySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'repairTicket',
      required: [true, 'Phiếu sửa chữa là bắt buộc'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày hết hạn bảo hành là bắt buộc'],
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model('warranty', warrantySchema);
