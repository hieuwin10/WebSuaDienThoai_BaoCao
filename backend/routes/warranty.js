const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warranty');
const repairTicketController = require('../controllers/repairTickets');
// Middleware xác thực bảo mật
const { CheckLogin, checkRole } = require('../utils/authHandler');

/**
 * [GET] /api/v1/warranty
 * Xem danh sách bảo hành (Nhân viên thấy hết, khách chỉ thấy của mình).
 */
router.get('/', CheckLogin, async (req, res) => {
  try {
    const warranties = await warrantyController.getWarrantiesForActor(req.user);
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/warranty/search
 * Tìm kiếm bảo hành thông qua Mã phiếu hoặc Hãng điện thoại.
 * Ví dụ: /api/v1/warranty/search?q=Apple
 */
router.get('/search', CheckLogin, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    // 1. Tìm các phiếu mà khách có quyền xem mà khớp với từ khóa search
    const tickets = await repairTicketController.getTicketsForActor(req.user);
    const matchedTicketIds = tickets
      .filter((t) => {
        const code = String(t.ticket_code || '');
        const brand = String(t.device_id?.brand || '');
        return code.includes(q) || brand.includes(q);
      })
      .map((t) => t._id);

    // 2. Trả về thông tin bảo hành đính kèm với phiếu đó
    const result = await warrantyController.searchByTicket(matchedTicketIds);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/warranty/:id
 * Xem chi tiết thông số một bản ghi bảo hành.
 */
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const warranty = await warrantyController.getWarrantyById(req.params.id);
    if (!warranty) return res.status(404).json({ message: 'Không tìm thấy bảo hành' });
    
    // Kiểm tra bảo mật: Nếu là khách, chỉ cho xem nếu nó thuộc về phiếu sửa chữa của họ
    const ticket = warranty.ticket;
    if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem bản ghi bảo hành này' });
    }
    res.json(warranty);
  } catch (err) {
    res.status(404).json({ message: 'Mã bảo hành không hợp lệ.' });
  }
});

/**
 * [POST] /api/v1/warranty
 * Tạo mới phiếu bảo hành (Thường hệ thống tự tạo khi Sửa chữa hoàn thành).
 */
router.post('/', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const warranty = await warrantyController.createWarranty(req.body);
    res.status(201).json(warranty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [PUT] /api/v1/warranty/:id
 * Gia hạn bảo hành hoặc sửa ghi chú (Admin/Mod).
 */
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const updated = await warrantyController.updateWarranty(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy bảo hành' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [DELETE] /api/v1/warranty/:id
 * Xóa bản ghi bảo hành khỏi hệ thống.
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const deleted = await warrantyController.deleteWarranty(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy bảo hành' });
    res.json({ message: 'Xóa bảo hành thành công.', warranty: deleted });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
