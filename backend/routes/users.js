var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
let { CreateAnUserValidator, ModifyAnUserValidator, validatedResult } = require("../utils/validator");
let { CheckLogin, checkRole } = require("../utils/authHandler");
let { isStaff } = require("../utils/roleUtils");

/**
 * [GET] /api/v1/users
 * Lấy danh sách toàn bộ người dùng (Chỉ ADMIN và MODERATOR).
 */
router.get("/", CheckLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * [GET] /api/v1/users/:id
 * Xem thông tin chi tiết của một người dùng.
 * Bảo mật: Khách thường chỉ xem được chính mình. Admin/Mod xem được tất cả.
 */
router.get("/:id", CheckLogin, async function (req, res, next) {
  try {
    // Kiểm tra quyền: Nếu không phải nhân viên và đang xem ID của người khác -> Bị cấm
    if (!isStaff(req.user) && String(req.params.id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Bạn không có quyền xem thông tin người dùng này." });
    }
    let user = await userController.GetUserById(req.params.id);
    if (!user) return res.status(404).send({ message: "Không tìm thấy người dùng." });
    res.send(user);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

/**
 * [POST] /api/v1/users
 * Admin tạo mới một tài khoản người dùng thủ công.
 */
router.post("/", CheckLogin, checkRole("ADMIN"), CreateAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let newUser = await userController.CreateAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.role
    );
    res.send(newUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/**
 * [PUT] /api/v1/users/:id
 * Admin cập nhật thông tin tài khoản người dùng khác.
 */
router.put("/:id", CheckLogin, checkRole("ADMIN"), ModifyAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let updatedUser = await userController.UpdateUser(req.params.id, req.body);
    if (!updatedUser) return res.status(404).send({ message: "Không tìm thấy người dùng." });
    res.send(updatedUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/**
 * [DELETE] /api/v1/users/:id
 * Xóa một tài khoản (Chỉ Admin).
 */
router.delete("/:id", CheckLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let deletedUser = await userController.DeleteUser(req.params.id);
    if (!deletedUser) return res.status(404).send({ message: "Không tìm thấy người dùng." });
    res.send({ message: "Xóa người dùng thành công.", user: deletedUser });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

/**
 * [PATCH] /api/v1/users/:id/lock
 * Admin thực hiện khóa hoặc mở khóa tài khoản thủ công.
 */
router.patch("/:id/lock", CheckLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let user = await userController.ToggleLock(req.params.id);
    if (!user) return res.status(404).send({ message: "Không tìm thấy người dùng." });
    res.send({ message: "Cập nhật trạng thái khóa tài khoản thành công.", lockTime: user.lockTime });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
