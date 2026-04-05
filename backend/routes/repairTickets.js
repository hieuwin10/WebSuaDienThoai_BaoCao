const express = require('express');
const router = express.Router();
const repairTicketController = require('../controllers/repairTickets');
const deviceController = require('../controllers/devices');
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { isStaff } = require('../utils/roleUtils');

// GET /api/v1/repair-tickets
router.get('/', CheckLogin, async (req, res) => {
  try {
    const tickets = await repairTicketController.getTicketsForActor(req.user);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/repair-tickets/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const ticket = await repairTicketController.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem phiếu này' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

// POST /api/v1/repair-tickets — khách chỉ tạo phiếu cho thiết bị của mình
router.post('/', CheckLogin, async (req, res) => {
  try {
    const device = await deviceController.getDeviceById(req.body.device_id);
    if (!device) {
      return res.status(400).json({ message: 'Thiết bị không tồn tại' });
    }
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

// PUT /api/v1/repair-tickets/:id
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.updateTicket(req.params.id, req.body);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/v1/repair-tickets/:id/status
router.patch('/:id/status', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.updateStatus(req.params.id, req.body.status);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/v1/repair-tickets/:id/cancel
router.patch('/:id/cancel', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.cancelTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json({ message: 'Đã hủy phiếu thành công', ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/repair-tickets/:id
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
