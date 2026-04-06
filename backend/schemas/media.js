let mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng Media (Ảnh/Video đính kèm phiếu sửa chữa)
let mediaSchema = new mongoose.Schema(
  {
    // Tham chiếu tới phiếu sửa chữa (Repair Ticket) mà ảnh này thuộc về
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'repairTicket',
      required: [true, 'Phiếu sửa chữa là bắt buộc'],
    },
    // Đường dẫn (URL) để xem ảnh trên trình duyệt
    url: {
      type: String,
      required: [true, 'URL ảnh là bắt buộc'],
    },
    // Loại ảnh: 'before' (ảnh lúc nhận máy) hoặc 'after' (ảnh sau khi đã sửa xong)
    type: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },
    // Người thực hiện tải ảnh này lên (thường là nhân viên kỹ thuật)
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  { 
    // Tự động tạo createdAt và updatedAt
    timestamps: true 
  }
);

module.exports = new mongoose.model('media', mediaSchema);
