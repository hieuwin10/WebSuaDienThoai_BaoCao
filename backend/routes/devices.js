const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/devices');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
// Import các Middleware để xác thực người dùng và phân quyền
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { isStaff } = require('../utils/roleUtils');

/**
 * [GET] /api/v1/devices
 * Lấy danh sách thiết bị. 
 * Kỹ thuật viên xem tất cả, khách hàng chỉ thấy máy của họ.
 */
router.get('/', CheckLogin, catchAsync(async (req, res) => {
  const devices = await deviceController.getDevicesForActor(req.user);
  res.json(devices);
}));

/**
 * [GET] /api/v1/devices/:id
 * Lấy thông tin chi tiết một thiết bị cụ thể kèm theo kiểm tra quyền sở hữu.
 */
router.get('/:id', CheckLogin, catchAsync(async (req, res) => {
  const device = await deviceController.getDeviceById(req.params.id);
  if (!device) {
    throw new AppError('Không tìm thấy thiết bị', 404);
  }
  // Kiểm tra bảo mật: Nếu không phải nhân viên, chỉ cho phép xem nếu họ là chủ sở hữu
  if (!isStaff(req.user)) {
    const owner = device.customer_id?._id || device.customer_id;
    if (!owner || String(owner) !== String(req.user._id)) {
      throw new AppError('Bạn không có quyền xem thiết bị này', 403);
    }
  }
  res.json(device);
}));

/**
 * [POST] /api/v1/devices
 * Đăng ký thiết bị mới.
 * Khách hàng khi đăng ký máy sẽ tự động gán customer_id cho chính họ để tránh mạo danh.
 */
router.post('/', CheckLogin, catchAsync(async (req, res) => {
  const body = { ...req.body };
  // Bảo mật: Khách hàng không được tự ý gán máy cho người khác
  if (!isStaff(req.user)) {
    body.customer_id = req.user._id;
  }
  const device = await deviceController.createDevice(body);
  res.json(device);
}));

/**
 * [PUT] /api/v1/devices/:id
 * Chỉnh sửa thông tin máy (Chỉ dành cho ADMIN hoăc MODERATOR).
 */
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), catchAsync(async (req, res) => {
  const device = await deviceController.updateDevice(req.params.id, req.body);
  if (!device) {
    throw new AppError('Không tìm thấy thiết bị', 404);
  }
  res.json(device);
}));

/**
 * [DELETE] /api/v1/devices/:id
 * Xóa thiết bị (Chỉ ADMIN mới có quyền xóa).
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), catchAsync(async (req, res) => {
  const device = await deviceController.deleteDevice(req.params.id);
  if (!device) {
    throw new AppError('Không tìm thấy thiết bị', 404);
  }
  res.json({ message: 'Xóa thiết bị thành công.', device });
}));

module.exports = router;
