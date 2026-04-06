const mongoose = require('mongoose');

/**
 * Định nghĩa cấu trúc (Schema) cho bảng Profiles (Thông tin chi tiết người dùng)
 * Bảng này tách biệt với bảng Users để giữ cho việc đăng nhập nhẹ nhàng hơn.
 */
const profileSchema = new mongoose.Schema({
  // Liên kết 1-1 tới tài khoản đăng nhập (User Model)
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true
  },
  // Họ và tên đầy đủ của người dùng
  full_name: {
    type: String,
    required: true
  },
  // Số điện thoại liên lạc (Bắt buộc và duy nhất)
  phone: {
    type: String,
    required: true,
    unique: true
  },
  // Địa chỉ cư trú
  address: {
    type: String
  },
  // Đường dẫn ảnh đại diện
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  },
  // Đường dẫn ảnh bìa (Cover Image)
  cover_image: {
    type: String,
    default: null,
  },
}, { 
  // Lưu vết thời gian cập nhật thông tin
  timestamps: true 
});

module.exports = mongoose.model('profile', profileSchema);
