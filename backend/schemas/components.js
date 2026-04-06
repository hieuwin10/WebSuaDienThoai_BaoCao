const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng Components (Kho linh kiện)
const componentSchema = new mongoose.Schema({
  // Tên linh kiện (ví dụ: Màn hình iPhone 13, Pin dung lượng cao...)
  name: {
    type: String,
    required: true
  },
  // Mã SKU (Mã kho - Unique) dùng để quản lý nhập xuất chính xác
  sku: {
    type: String,
    required: true,
    unique: true
  },
  // Số lượng còn lại trong kho (Không được phép âm)
  stock_quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  // Giá bán lẻ của linh kiện
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { 
  // Lưu thời gian tạo và cập nhật linh kiện
  timestamps: true 
});

module.exports = mongoose.model('component', componentSchema);
