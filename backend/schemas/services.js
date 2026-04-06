const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng Services (Danh mục dịch vụ sửa chữa)
const serviceSchema = new mongoose.Schema({
  // Tên dịch vụ (ví dụ: Thay pin, Ép kính, Vệ sinh máy...)
  name: {
    type: String,
    required: true
  },
  // Mô tả chi tiết về quy trình hoặc nội dung dịch vụ
  description: {
    type: String
  },
  // Giá cơ bản của dịch vụ (Chưa tính tiền linh kiện)
  base_price: {
    type: Number,
    required: true,
    min: 0
  },
  // Thời gian xử lý dự kiến (ví dụ: 30-60 phút)
  estimated_time: {
    type: String,
    default: "30-60 phút"
  }
}, { 
  // Lưu thời gian tạo và cập nhật dịch vụ
  timestamps: true 
});

module.exports = mongoose.model('service', serviceSchema);
