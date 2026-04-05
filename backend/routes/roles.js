const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roles');
const { CheckLogin, checkRole } = require('../utils/authHandler');

// GET /api/v1/roles
router.get('/', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const roles = await roleController.getAllRoles();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/roles/:id
router.get('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const role = await roleController.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Không tìm thấy vai trò.' });
    res.json(role);
  } catch (err) {
    res.status(404).json({ message: 'Mã vai trò không hợp lệ hoặc không tồn tại.' });
  }
});

// POST /api/v1/roles
router.post('/', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const newRole = await roleController.createRole(req.body);
    res.status(201).json(newRole);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Vai trò đã tồn tại.' });
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/v1/roles/:id
router.put('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const updated = await roleController.updateRole(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy vai trò.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/roles/:id
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
