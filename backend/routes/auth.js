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
let roleModel = require("../schemas/roles");
let mongoose = require("mongoose");
let JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'AUTH_TOKEN'

router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let result = await userController.QueryLogin(username, password);
    if (!result) {
        res.status(401).send("thong tin dang nhap khong dung")
    } else {
        res.cookie(JWT_COOKIE_NAME, result, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        })
        res.send(result)
    }
})

router.post("/register", RegisterValidator, validatedResult, async function (req, res) {
  let session = await mongoose.startSession();
  session.startTransaction()
  try {
    let { username, password, email, fullName } = req.body;
    let userRole = await roleModel.findOne({ name: "USER" });
    let roleId = userRole ? userRole._id : "66a1a1a1a1a1a1a1a1a1a1a1";

    let newUser = await userController.CreateAnUser(
      username,
      password,
      email,
      roleId,
      session,
      fullName
    );

    let newProfile = new profileModel({
      user_id: newUser._id,
      full_name: fullName || username,
      phone: `TEMP_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      address: "N/A",
    });
    await newProfile.save({ session });

    await session.commitTransaction()
    await session.endSession()
    res.send(newUser)
  } catch (error) {
    try {
      await session.abortTransaction()
      await session.endSession()
    } catch (sessionError) {
      // keep original error response
    }
    res.status(404).send(error.message);
  }
});

router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user)
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
      return res.status(400).send({ message: "oldpassword khong dung" });
    }
    res.send({ message: "doi mat khau thanh cong" });
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
      return res.status(404).send({ message: "email khong ton tai" });
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
      return res.status(500).send({ message: "gui email that bai", error: error.message });
    }

    res.send({ message: "da gui email reset password" });
  }
);

router.post("/resetpassword/:token", async function (req, res) {
  let { token } = req.params;
  let { newpassword } = req.body;
  if (!newpassword) {
    return res.status(400).send({ message: "newpassword khong duoc de trong" });
  }

  let user = await userController.GetUserByToken(token);
  if (!user) {
    return res.status(400).send({ message: "token khong hop le hoac da het han" });
  }

  user.password = newpassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordTokenExp = null;
  await user.save();
  res.send({ message: "reset password thanh cong" });
});

router.post('/logout', CheckLogin, async function (req, res, next) {
    res.cookie(JWT_COOKIE_NAME, null, { maxAge: 0 })
    res.send("logout")
})

module.exports = router;
