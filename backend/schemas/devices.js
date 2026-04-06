const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng Devices (Thiết bị) trong Database
const deviceSchema = new mongoose.Schema({
  // Liên kết tới bảng User (Chủ sở hữu thiết bị)
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Tham chiếu đến model 'user'
    required: true
  },
  // Hãng sản xuất (như Apple, Samsung, Xiaomi...)
  brand: {
    type: String,
    required: true
  },
  // Tên máy / Model (như iPhone 15 Pro Max, Galaxy S24 Ultra...)
  model_name: {
    type: String,
    required: true
  },
  // Mã số định danh IMEI (phải là duy nhất - unique để không bị trùng lặp thiết bị)
  imei: {
    type: String,
    required: true,
    unique: true
  },
  // Màu sắc của máy
  color: {
    type: String
  },
  // Tình trạng vật lý ban đầu khi nhận máy (ví dụ: máy bị vỡ kính, máy không lên nguồn...)
  condition_on_arrival: {
    type: String,
    default: "Bình thường"
  }
}, { 
  // Tự động tạo 2 trường: createdAt (ngày tạo) và updatedAt (ngày cập nhật cuối cùng)
  timestamps: true 
});

module.exports = mongoose.model('device', deviceSchema);
