const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Import các validator để kiểm tra dữ liệu đầu vào (format email, độ dài mật khẩu...)
const {
  RegisterValidator,
  validatedResult,
  ChangePasswordValidator,
  ForgotPasswordValidator,
} = require("../utils/validator");
const { CheckLogin } = require("../utils/authHandler"); // Middleware kiểm tra đăng nhập
const crypto = require("crypto"); // Thư viện tạo token ngẫu nhiên
const { sendMail } = require("../utils/sendMail"); // Hàm gửi email
const profileModel = require("../schemas/profiles");
const profileController = require("../controllers/profiles");
const roleModel = require("../schemas/roles");
const userModel = require("../schemas/users");
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'AUTH_TOKEN';

/**
 * [POST] /api/v1/auth/login
 * Xử lý đăng nhập người dùng
 */
router.post('/login', catchAsync(async function (req, res, next) {
    const { username, password } = req.body;
    const result = await userController.QueryLogin(username, password);
    
    if (!result) {
        throw new AppError('Thông tin đăng nhập không đúng.', 401);
    } else {
        res.cookie(JWT_COOKIE_NAME, result, {
            maxAge: 24 * 60 * 60 * 1000, // Hết hạn sau 24 giờ
            httpOnly: true, // Bảo mật: Chỉ Server mới đọc được cookie
            secure: false // Đặt là true nếu chạy trên HTTPS
        });
        res.send(result);
    }
}));

/**
 * [POST] /api/v1/auth/register
 * Đăng ký tài khoản mới và tạo Profile mặc định
 */
router.post("/register", RegisterValidator, validatedResult, catchAsync(async function (req, res) {
  let newUser = null;
  try {
    const { username, password, email, fullName } = req.body;
    
    const userRole = await roleModel.findOne({ name: "USER" });
    const roleId = userRole ? userRole._id : "66a1a1a1a1a1a1a1a1a1a1a1";

    newUser = await userController.CreateAnUser(
      username,
      password,
      email,
      roleId,
      null,
      fullName
    );

    const newProfile = new profileModel({
      user_id: newUser._id,
      full_name: fullName || username,
      phone: `TEMP_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      address: "N/A",
    });
    await newProfile.save();

    res.send(newUser);
  } catch (error) {
    if (newUser && newUser._id) {
      await userModel.deleteOne({ _id: newUser._id }).catch(() => {});
    }
    throw error;
  }
}));

/**
 * [GET] /api/v1/auth/me
 * Lấy thông tin chi tiết của người dùng đang đăng nhập (bao gồm cả Profile)
 */
router.get('/me', CheckLogin, catchAsync(async function (req, res, next) {
    const profile = await profileController.getProfileByUserId(req.user._id);
    const u = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete u.password;

    let profileLite = null;
    if (profile) {
        const p = profile.toObject ? profile.toObject() : profile;
        profileLite = {
            avatar: p.avatar,
            cover_image: p.cover_image,
            full_name: p.full_name,
            phone: p.phone,
            address: p.address,
        };
    }
    res.json({ ...u, profile: profileLite });
}));

/**
 * [POST] /api/v1/auth/changepassword
 * Đổi mật khẩu cho người dùng hiện tại
 */
router.post(
  "/changepassword",
  CheckLogin,
  ChangePasswordValidator,
  validatedResult,
  catchAsync(async function (req, res) {
    const { oldpassword, newpassword } = req.body;
    const result = await userController.ChangePassword(req.user, oldpassword, newpassword);
    if (!result) {
      throw new AppError('Mật khẩu hiện tại không đúng.', 400);
    }
    res.json({ message: 'Đổi mật khẩu thành công.' });
  })
);

/**
 * [POST] /api/v1/auth/forgotpassword
 * Gửi email khôi phục mật khẩu khi người dùng quên
 */
router.post(
  "/forgotpassword",
  ForgotPasswordValidator,
  validatedResult,
  catchAsync(async function (req, res) {
    const { email } = req.body;
    const user = await userController.GetUserByEmail(email);
    if (!user) {
      throw new AppError('Không tìm thấy email trong hệ thống.', 404);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.forgotPasswordToken = token;
    user.forgotPasswordTokenExp = Date.now() + 10 * 60 * 1000;
    await user.save();

    const appUrl = (process.env.APP_URL || "http://localhost:5001").replace(/\/$/, "");
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
    
    try {
      await sendMail(user.email, resetUrl);
    } catch (error) {
      throw new AppError('Gửi email thất bại: ' + error.message, 500);
    }

    res.json({ message: 'Đã gửi email hướng dẫn đặt lại mật khẩu.' });
  })
);

/**
 * [POST] /api/v1/auth/resetpassword/:token
 * Đặt lại mật khẩu mới thông qua Token nhận được từ email
 */
router.post("/resetpassword/:token", catchAsync(async function (req, res) {
  const { token } = req.params;
  const { newpassword } = req.body;
  if (!newpassword) {
    throw new AppError('Mật khẩu mới không được để trống.', 400);
  }

  const user = await userController.GetUserByToken(token);
  if (!user) {
    throw new AppError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 400);
  }

  user.password = newpassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordTokenExp = null;
  await user.save();
  res.json({ message: 'Đặt lại mật khẩu thành công.' });
}));

/**
 * [POST] /api/v1/auth/logout
 * Đăng xuất: Xóa bỏ Cookie lưu Token
 */
router.post('/logout', CheckLogin, catchAsync(async function (req, res, next) {
    res.cookie(JWT_COOKIE_NAME, null, { maxAge: 0 });
    res.json({ message: 'Đăng xuất thành công.' });
}));

module.exports = router;
