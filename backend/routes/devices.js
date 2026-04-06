const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/devices');
// Import các Middleware để xác thực người dùng và phân quyền
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { isStaff } = require('../utils/roleUtils');

/**
 * [GET] /api/v1/devices
 * Lấy danh sách thiết bị. 
 * Ký thuật viên xem tất cả, khách hàng chỉ thấy máy của họ.
 */
router.get('/', CheckLogin, async (req, res) => {
  try {
    const devices = await deviceController.getDevicesForActor(req.user);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/devices/:id
 * Lấy thông tin chi tiết một thiết bị cụ thể kèm theo kiểm tra quyền sở hữu.
 */
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const device = await deviceController.getDeviceById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    // Kiểm tra bảo mật: Nếu không phải nhân viên, chỉ cho phép xem nếu họ là chủ sở hữu
    if (!isStaff(req.user)) {
      const owner = device.customer_id?._id || device.customer_id;
      if (!owner || String(owner) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Bạn không có quyền xem thiết bị này' });
      }
    }
    res.json(device);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

/**
 * [POST] /api/v1/devices
 * Đăng ký thiết bị mới.
 * Khách hàng khi đăng ký máy sẽ tự động gán customer_id cho chính họ để tránh mạo danh.
 */
router.post('/', CheckLogin, async (req, res) => {
  try {
    const body = { ...req.body };
    // Bảo mật: Khách hàng không được tự ý gán máy cho người khác
    if (!isStaff(req.user)) {
      body.customer_id = req.user._id;
    }
    const device = await deviceController.createDevice(body);
    res.json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [PUT] /api/v1/devices/:id
 * Chỉnh sửa thông tin máy (Chỉ dành cho ADMIN hoăc MODERATOR).
 */
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const device = await deviceController.updateDevice(req.params.id, req.body);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [DELETE] /api/v1/devices/:id
 * Xóa thiết bị (Chỉ ADMIN mới có quyền xóa).
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const device = await deviceController.deleteDevice(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json({ message: 'Xóa thiết bị thành công.', device });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
