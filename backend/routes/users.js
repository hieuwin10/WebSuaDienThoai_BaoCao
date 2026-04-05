var express = require("express");
var router = express.Router();
let userController = require("../controllers/users");
let { CreateAnUserValidator, ModifyAnUserValidator, validatedResult } = require("../utils/validator");
let { CheckLogin, checkRole } = require("../utils/authHandler");
let { isStaff } = require("../utils/roleUtils");

router.get("/", CheckLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// USER chỉ xem được chính mình; ADMIN/MODERATOR xem được mọi id
router.get("/:id", CheckLogin, async function (req, res, next) {
  try {
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

router.put("/:id", CheckLogin, checkRole("ADMIN"), ModifyAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let updatedUser = await userController.UpdateUser(req.params.id, req.body);
    if (!updatedUser) return res.status(404).send({ message: "Không tìm thấy người dùng." });
    res.send(updatedUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", CheckLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let deletedUser = await userController.DeleteUser(req.params.id);
    if (!deletedUser) return res.status(404).send({ message: "Không tìm thấy người dùng." });
    res.send({ message: "Xóa người dùng thành công.", user: deletedUser });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

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
