var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
// Import các validator để kiểm tra dữ liệu đầu vào (format email, độ dài mật khẩu...)
let {
  RegisterValidator,
  validatedResult,
  ChangePasswordValidator,
  ForgotPasswordValidator,
} = require("../utils/validator");
let { CheckLogin } = require("../utils/authHandler"); // Middleware kiểm tra đăng nhập
let crypto = require("crypto"); // Thư viện tạo token ngẫu nhiên
let { sendMail } = require("../utils/sendMail"); // Hàm gửi email
let profileModel = require("../schemas/profiles");
let profileController = require("../controllers/profiles");
let roleModel = require("../schemas/roles");
let userModel = require("../schemas/users");
let JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'AUTH_TOKEN'

/**
 * [POST] /api/v1/auth/login
 * Xử lý đăng nhập người dùng
 */
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    // Gọi hàm QueryLogin để kiểm tra username/password và lấy Token
    let result = await userController.QueryLogin(username, password);
    
    if (!result) {
        res.status(401).json({ message: 'Thông tin đăng nhập không đúng.' })
    } else {
        // Lưu Token vào Cookie để các request sau tự động gửi lên
        res.cookie(JWT_COOKIE_NAME, result, {
            maxAge: 24 * 60 * 60 * 1000, // Hết hạn sau 24 giờ
            httpOnly: true, // Bảo mật: Chỉ Server mới đọc được cookie
            secure: false // Đặt là true nếu chạy trên HTTPS
        })
        res.send(result) // Trả về thông tin người dùng kèm token
    }
})

// Không dùng startTransaction: MongoDB standalone (Docker mặc định) không phải replica set → lỗi
// "Transaction numbers are only allowed on a replica set member or mongos"

/**
 * [POST] /api/v1/auth/register
 * Đăng ký tài khoản mới và tạo Profile mặc định
 */
// Sử dụng RegisterValidator để kiểm tra đầu vào trước khi xử lý
router.post("/register", RegisterValidator, validatedResult, async function (req, res) {
  let newUser = null;
  try {
    let { username, password, email, fullName } = req.body;
    
    // Tìm role mặc định là "USER"
    let userRole = await roleModel.findOne({ name: "USER" });
    let roleId = userRole ? userRole._id : "66a1a1a1a1a1a1a1a1a1a1a1";

    // 1. Tạo tài khoản người dùng mới
    newUser = await userController.CreateAnUser(
      username,
      password,
      email,
      roleId,
      null,
      fullName
    );

    // 2. Tự động tạo Profile cá nhân đi kèm với tài khoản vừa tạo
    const newProfile = new profileModel({
      user_id: newUser._id,
      full_name: fullName || username,
      phone: `TEMP_${Date.now()}_${Math.floor(Math.random() * 10000)}`, // Tạo số điện thoại tạm thời
      address: "N/A",
    });
    await newProfile.save();

    res.send(newUser);
  } catch (error) {
    // Nếu có lỗi sau khi đã tạo User (ví dụ: lỗi tạo Profile), hãy xóa User vừa tạo để tránh rác database
    if (newUser && newUser._id) {
      try {
        await userModel.deleteOne({ _id: newUser._id });
      } catch (_) { /* bỏ qua lỗi xóa */ }
    }
    res.status(400).send({ message: error.message });
  }
});

/**
 * [GET] /api/v1/auth/me
 * Lấy thông tin chi tiết của người dùng đang đăng nhập (bao gồm cả Profile)
 */
router.get('/me', CheckLogin, async function (req, res, next) {
    try {
        // Lấy thông tin profile dựa trên ID của user đang đăng nhập
        const profile = await profileController.getProfileByUserId(req.user._id);
        const u = req.user.toObject ? req.user.toObject() : { ...req.user };
        delete u.password; // Bảo mật: Không bao giờ trả mật khẩu về cho Frontend

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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

/**
 * [POST] /api/v1/auth/changepassword
 * Đổi mật khẩu cho người dùng hiện tại
 */
router.post(
  "/changepassword",
  CheckLogin,
  ChangePasswordValidator,
  validatedResult,
  async function (req, res) {
    let { oldpassword, newpassword } = req.body;
    let result = await userController.ChangePassword(req.user, oldpassword, newpassword);
    if (!result) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }
    res.json({ message: 'Đổi mật khẩu thành công.' });
  }
);

/**
 * [POST] /api/v1/auth/forgotpassword
 * Gửi email khôi phục mật khẩu khi người dùng quên
 */
router.post(
  "/forgotpassword",
  ForgotPasswordValidator,
  validatedResult,
  async function (req, res) {
    let { email } = req.body;
    // Kiểm tra xem email có tồn tại trong hệ thống không
    let user = await userController.GetUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy email trong hệ thống.' });
    }

    // Tạo token ngẫu nhiên và lưu vào database (hết hạn sau 10 phút)
    const token = crypto.randomBytes(32).toString("hex");
    user.forgotPasswordToken = token;
    user.forgotPasswordTokenExp = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Tạo đường dẫn gửi cho khách hàng click vào
    const appUrl = (process.env.APP_URL || "http://localhost:5001").replace(/\/$/, "");
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
    
    try {
      // Gửi email chứa link đặt lại mật khẩu
      await sendMail(user.email, resetUrl);
    } catch (error) {
      return res.status(500).json({ message: 'Gửi email thất bại.', error: error.message });
    }

    res.json({ message: 'Đã gửi email hướng dẫn đặt lại mật khẩu.' });
  }
);

/**
 * [POST] /api/v1/auth/resetpassword/:token
 * Đặt lại mật khẩu mới thông qua Token nhận được từ email
 */
router.post("/resetpassword/:token", async function (req, res) {
  let { token } = req.params;
  let { newpassword } = req.body;
  if (!newpassword) {
    return res.status(400).json({ message: 'Mật khẩu mới không được để trống.' });
  }

  // Tìm user có token khớp và còn hạn
  let user = await userController.GetUserByToken(token);
  if (!user) {
    return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
  }

  // Cập nhật mật khẩu mới và xóa bỏ token cũ
  user.password = newpassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordTokenExp = null;
  await user.save();
  res.json({ message: 'Đặt lại mật khẩu thành công.' });
});

/**
 * [POST] /api/v1/auth/logout
 * Đăng xuất: Xóa bỏ Cookie lưu Token
 */
router.post('/logout', CheckLogin, async function (req, res, next) {
    res.cookie(JWT_COOKIE_NAME, null, { maxAge: 0 }) // Xóa cookie bằng cách cho hết hạn ngay lập tức
    res.json({ message: 'Đăng xuất thành công.' })
})

module.exports = router;
