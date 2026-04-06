const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng Roles (Quyền hạn/Vai trò)
const roleSchema = new mongoose.Schema(
  {
    // Tên quyền (Ví dụ: ADMIN, STAFF, USER)
    name: {
      type: String,
      required: [true, 'Tên role là bắt buộc'],
      unique: true, // Không được phép trùng tên quyền
      uppercase: true, // Luôn lưu ở dạng chữ in hoa
      trim: true,
    },
    // Mô tả chi tiết về quyền này có thể làm gì
    description: {
      type: String,
      default: '',
    },
    // Đánh dấu xóa mềm (Soft Delete) - giúp giữ lại dữ liệu lịch sử
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { 
    // Lưu vết thời gian tạo và chỉnh sửa
    timestamps: true 
  }
);

module.exports = mongoose.model('role', roleSchema);
