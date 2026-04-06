const express = require('express');
const router = express.Router();
const repairTicketController = require('../controllers/repairTickets');
const deviceController = require('../controllers/devices');
// Middleware xác thực và phân quyền
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { isStaff } = require('../utils/roleUtils');

/**
 * [GET] /api/v1/repair-tickets
 * Lấy danh sách phiếu sửa chữa (Nhân viên thấy hết, khách chỉ thấy của mình).
 */
router.get('/', CheckLogin, async (req, res) => {
  try {
    const tickets = await repairTicketController.getTicketsForActor(req.user);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/repair-tickets/:id
 * Xem chi tiết một phiếu sửa chữa (Có kiểm tra quyền sở hữu).
 */
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const ticket = await repairTicketController.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    
    // Kiểm tra: Nếu là khách, chỉ cho phép xem nếu phiếu này gắn với máy của họ
    if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem phiếu này' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

/**
 * [POST] /api/v1/repair-tickets
 * Tạo phiếu mới. 
 * Bảo mật: Khách hàng chỉ được tạo phiếu cho THIẾT BỊ họ sở hữu.
 */
router.post('/', CheckLogin, async (req, res) => {
  try {
    const device = await deviceController.getDeviceById(req.body.device_id);
    if (!device) {
      return res.status(400).json({ message: 'Thiết bị không tồn tại' });
    }
    // Nếu không phải nhân viên, kiểm tra xem thiết bị này có phải của khách này không
    if (!isStaff(req.user)) {
      const owner = device.customer_id?._id || device.customer_id;
      if (!owner || String(owner) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Bạn chỉ có thể tạo phiếu cho thiết bị đã đăng ký của mình' });
      }
    }
    const ticket = await repairTicketController.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [PUT] /api/v1/repair-tickets/:id
 * Cập nhật toàn diện thông tin phiếu (Chỉ dành cho Admin/Mod).
 */
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.updateTicket(req.params.id, req.body);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [PATCH] /api/v1/repair-tickets/:id/status
 * Cập nhật trạng thái phiếu (Chỉ dành cho Admin/Mod).
 */
router.patch('/:id/status', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.updateStatus(req.params.id, req.body.status);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [PATCH] /api/v1/repair-tickets/:id/cancel
 * Hủy phiếu sửa chữa (Chỉ dành cho Admin/Mod).
 */
router.patch('/:id/cancel', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.cancelTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json({ message: 'Đã hủy phiếu thành công', ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [DELETE] /api/v1/repair-tickets/:id
 * Xóa vĩnh viễn phiếu (Chỉ Admin mới có quyền).
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const ticket = await repairTicketController.deleteTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json({ message: 'Xóa phiếu thành công', ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
