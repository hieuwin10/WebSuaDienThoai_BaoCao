var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
let {
  RegisterValidator,
  validatedResult,
  ChangePasswordValidator,
  ForgotPasswordValidator,
} = require("../utils/validator");
let { CheckLogin } = require("../utils/authHandler");
let crypto = require("crypto");
let { sendMail } = require("../utils/sendMail");
let profileModel = require("../schemas/profiles");
let profileController = require("../controllers/profiles");
let roleModel = require("../schemas/roles");
let userModel = require("../schemas/users");
let JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'AUTH_TOKEN'

router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(401).json({ message: 'Thông tin đăng nhập không đúng.' })
    } else {
        res.cookie(JWT_COOKIE_NAME, result, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        })
        res.send(result)
    }
})

// Không dùng startTransaction: MongoDB standalone (Docker mặc định) không phải replica set → lỗi
// "Transaction numbers are only allowed on a replica set member or mongos"
router.post("/register", RegisterValidator, validatedResult, async function (req, res) {
  let newUser = null;
  try {
    let { username, password, email, fullName } = req.body;
    let userRole = await roleModel.findOne({ name: "USER" });
    let roleId = userRole ? userRole._id : "66a1a1a1a1a1a1a1a1a1a1a1";

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
      try {
        await userModel.deleteOne({ _id: newUser._id });
      } catch (_) {
        /* bỏ qua */
      }
    }
    res.status(400).send({ message: error.message });
  }
});

router.get('/me', CheckLogin, async function (req, res, next) {
    try {
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

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

router.post(
  "/forgotpassword",
  ForgotPasswordValidator,
  validatedResult,
  async function (req, res) {
    let { email } = req.body;
    let user = await userController.GetUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy email trong hệ thống.' });
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
      return res.status(500).json({ message: 'Gửi email thất bại.', error: error.message });
    }

    res.json({ message: 'Đã gửi email hướng dẫn đặt lại mật khẩu.' });
  }
);

router.post("/resetpassword/:token", async function (req, res) {
  let { token } = req.params;
  let { newpassword } = req.body;
  if (!newpassword) {
    return res.status(400).json({ message: 'Mật khẩu mới không được để trống.' });
  }

  let user = await userController.GetUserByToken(token);
  if (!user) {
    return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
  }

  user.password = newpassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordTokenExp = null;
  await user.save();
  res.json({ message: 'Đặt lại mật khẩu thành công.' });
});

router.post('/logout', CheckLogin, async function (req, res, next) {
    res.cookie(JWT_COOKIE_NAME, null, { maxAge: 0 })
    res.json({ message: 'Đăng xuất thành công.' })
})

module.exports = router;
