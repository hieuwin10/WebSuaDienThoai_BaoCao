const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Định nghĩa cấu trúc (Schema) cho bảng Users (Tài khoản người dùng)
const userSchema = new mongoose.Schema(
  {
    // Tên đăng nhập
    username: {
      type: String,
      required: [true, 'Username là bắt buộc'],
      unique: true,
      trim: true,
    },
    // Mật khẩu (Luôn được mã hóa trước khi lưu)
    password: {
      type: String,
      required: [true, 'Password là bắt buộc'],
    },
    // Địa chỉ Email
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Họ và tên đầy đủ
    fullName: {
      type: String,
      default: '',
    },
    // Đường dẫn ảnh đại diện
    avatarUrl: {
      type: String,
      default: 'https://i.sstatic.net/l60Hf.png',
    },
    // Trạng thái hoạt động (true: bình thường, false: bị khóa)
    status: {
      type: Boolean,
      default: true,
    },
    // Quyền hạn (Liên kết tới bảng Roles)
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'role',
      required: [true, 'Role là bắt buộc'],
    },
    // Số lần đăng nhập sai liên tiếp (Để xử lý khóa tài khoản)
    loginCount: {
      type: Number,
      default: 0,
    },
    // Đánh dấu xóa mềm
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Thời điểm hết hạn khóa tài khoản (Nếu có)
    lockTime: {
      type: Date,
      default: null,
    },
    // Token phục vụ việc đặt lại mật khẩu (Forgot Password)
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordTokenExp: { type: Date, default: null },
  },
  { 
    // Lưu thời gian tạo và cập nhật cuối cùng
    timestamps: true 
  }
);

/**
 * Middleware (Hook) của Mongoose: Tự động mã hóa mật khẩu trước khi lưu (Save)
 * Mục đích: Đảm bảo mật khẩu trong Database luôn là mã băm (Hash), không thể đọc trộm.
 */
userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }
  // Nếu mật khẩu đã được băm rồi ($2...) thì không băm lại nữa
  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return;
  }
  // Thực hiện băm mật khẩu bằng thư viện bcrypt
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
});

/**
 * Middleware cho lệnh findOneAndUpdate (Update người dùng)
 * Đảm bảo khi đổi mật khẩu qua lệnh update, mật khẩu mới cũng được băm.
 */
userSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() || {};
  const password = update.password || (update.$set && update.$set.password);
  if (!password) {
    return;
  }
  if (typeof password === "string" && password.startsWith("$2")) {
    return;
  }
  const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  if (update.password) {
    update.password = hashed;
  } else {
    update.$set.password = hashed;
  }
  this.setUpdate(update);
});

module.exports = mongoose.model('user', userSchema);
