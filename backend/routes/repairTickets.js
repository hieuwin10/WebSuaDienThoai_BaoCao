const express = require('express');
const router = express.Router();
const repairTicketController = require('../controllers/repairTickets');
const deviceController = require('../controllers/devices');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
// Middleware xác thực và phân quyền
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { isStaff } = require('../utils/roleUtils');

/**
 * [GET] /api/v1/repair-tickets
 * Lấy danh sách phiếu sửa chữa (Nhân viên thấy hết, khách chỉ thấy của mình).
 */
router.get('/', CheckLogin, catchAsync(async (req, res) => {
  const tickets = await repairTicketController.getTicketsForActor(req.user);
  res.json(tickets);
}));

/**
 * [GET] /api/v1/repair-tickets/:id
 * Xem chi tiết một phiếu sửa chữa (Có kiểm tra quyền sở hữu).
 */
router.get('/:id', CheckLogin, catchAsync(async (req, res) => {
  const ticket = await repairTicketController.getTicketById(req.params.id);
  if (!ticket) {
    throw new AppError('Không tìm thấy phiếu', 404);
  }
  
  // Kiểm tra: Nếu là khách, chỉ cho phép xem nếu phiếu này gắn với máy của họ
  if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
    throw new AppError('Bạn không có quyền xem phiếu này', 403);
  }
  res.json(ticket);
}));

/**
 * [POST] /api/v1/repair-tickets
 * Tạo phiếu mới. 
 * Bảo mật: Khách hàng chỉ được tạo phiếu cho THIẾT BỊ họ sở hữu.
 */
router.post('/', CheckLogin, catchAsync(async (req, res) => {
  const device = await deviceController.getDeviceById(req.body.device_id);
  if (!device) {
    throw new AppError('Thiết bị không tồn tại', 400);
  }
  // Nếu không phải nhân viên, kiểm tra xem thiết bị này có phải của khách này không
  if (!isStaff(req.user)) {
    const owner = device.customer_id?._id || device.customer_id;
    if (!owner || String(owner) !== String(req.user._id)) {
      throw new AppError('Bạn chỉ có thể tạo phiếu cho thiết bị đã đăng ký của mình', 403);
    }
  }
  
  // Tự động tạo ticket_code nếu không có
  if (!req.body.ticket_code) {
    req.body.ticket_code = 'TC' + Date.now() + Math.floor(Math.random() * 1000);
  }

  // Validate số lượng linh kiện
  if (req.body.components_used) {
    for (const item of req.body.components_used) {
      if (item.quantity <= 0) {
        throw new AppError('Số lượng linh kiện phải lớn hơn 0', 400);
      }
    }
  }

  const ticket = await repairTicketController.createTicket(req.body);
  res.status(201).json(ticket);
}));

/**
 * [PUT] /api/v1/repair-tickets/:id
 * Cập nhật toàn diện thông tin phiếu (Chỉ dành cho Admin/Mod).
 */
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), catchAsync(async (req, res) => {
  const ticket = await repairTicketController.updateTicket(req.params.id, req.body);
  if (!ticket) {
    throw new AppError('Không tìm thấy phiếu', 404);
  }
  res.json(ticket);
}));

/**
 * [PATCH] /api/v1/repair-tickets/:id/status
 * Cập nhật trạng thái phiếu (Chỉ dành cho Admin/Mod).
 */
router.patch('/:id/status', CheckLogin, checkRole('ADMIN', 'MODERATOR'), catchAsync(async (req, res) => {
  const allowedStatus = ['pending', 'processing', 'completed', 'canceled'];
  if (!allowedStatus.includes(req.body.status)) {
    throw new AppError('Trạng thái không hợp lệ', 400);
  }
  const ticket = await repairTicketController.updateStatus(req.params.id, req.body.status);
  if (!ticket) {
    throw new AppError('Không tìm thấy phiếu', 404);
  }
  res.json(ticket);
}));

/**
 * [PATCH] /api/v1/repair-tickets/:id/cancel
 * Hủy phiếu sửa chữa (Chỉ dành cho Admin/Mod).
 */
router.patch('/:id/cancel', CheckLogin, checkRole('ADMIN', 'MODERATOR'), catchAsync(async (req, res) => {
  const ticket = await repairTicketController.cancelTicket(req.params.id);
  if (!ticket) {
    throw new AppError('Không tìm thấy phiếu', 404);
  }
  res.json({ message: 'Đã hủy phiếu thành công', ticket });
}));

/**
 * [DELETE] /api/v1/repair-tickets/:id
 * Xóa vĩnh viễn phiếu (Chỉ Admin mới có quyền).
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), catchAsync(async (req, res) => {
  const ticket = await repairTicketController.deleteTicket(req.params.id);
  if (!ticket) {
    throw new AppError('Không tìm thấy phiếu', 404);
  }
  res.json({ message: 'Xóa phiếu thành công', ticket });
}));

module.exports = router;
