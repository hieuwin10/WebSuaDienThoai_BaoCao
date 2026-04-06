const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roles');
// Middleware xác thực bảo vệ các API quản trị
const { CheckLogin, checkRole } = require('../utils/authHandler');

/**
 * [GET] /api/v1/roles
 * Lấy danh sách các vai trò (Chỉ ADMIN mới được lấy danh sách này).
 */
router.get('/', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const roles = await roleController.getAllRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/roles/:id
 * Xem chi tiết thông tin một vai trò.
 */
router.get('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const role = await roleController.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Không tìm thấy vai trò.' });
    res.json(role);
  } catch (err) {
    res.status(404).json({ message: 'Mã vai trò không hợp lệ hoặc không tồn tại.' });
  }
});

/**
 * [POST] /api/v1/roles
 * Tạo mới một vai trò (Tên quyền phải là duy nhất).
 */
router.post('/', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const newRole = await roleController.createRole(req.body);
    res.status(201).json(newRole);
  } catch (err) {
    // Xử lý lỗi trùng tên (Mã lỗi MongoDB: 11000)
    if (err.code === 11000) return res.status(400).json({ message: 'Vai trò đã tồn tại.' });
    res.status(400).json({ message: err.message });
  }
});

/**
 * [PUT] /api/v1/roles/:id
 * Chỉnh sửa mô tả hoặc tên vai trò.
 */
router.put('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const updated = await roleController.updateRole(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy vai trò.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [DELETE] /api/v1/roles/:id
 * Xóa mềm vai trò khỏi hệ thống.
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const deleted = await roleController.deleteRole(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy vai trò.' });
    res.json({ message: 'Xóa vai trò thành công.', role: deleted });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
