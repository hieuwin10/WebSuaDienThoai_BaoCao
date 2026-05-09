let mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng Warranty (Bảo hành)
const warrantySchema = new mongoose.Schema(
  {
    // Liên kết tới phiếu sửa chữa đã hoàn thành
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'repairTicket',
      required: [true, 'Phiếu sửa chữa là bắt buộc'],
    },
    // Ngày bắt đầu bảo hành (Mặc định là ngày tạo phiếu bảo hành)
    startDate: {
      type: Date,
      default: Date.now,
    },
    // Ngày hết hạn bảo hành (Bắt buộc phải có để tính toán hiệu lực)
    endDate: {
      type: Date,
      required: [true, 'Ngày hết hạn bảo hành là bắt buộc'],
    },
    // Trạng thái bảo hành (Ví dụ: active, expired)
    status: {
      type: String,
      default: 'active',
    },
    // Các ghi chú về phạm vi bảo hành (ví dụ: Không bảo hành rơi vỡ, vào nước...)
    note: {
      type: String,
    },
  },
  { 
    // Lưu vết thời gian tạo và cập nhật
    timestamps: true 
  }
);

module.exports = new mongoose.model('warranty', warrantySchema);
