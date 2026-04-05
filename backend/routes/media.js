const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media');
const repairTicketController = require('../controllers/repairTickets');
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { uploadImage } = require('../utils/uploadHandler');

// GET /api/v1/media
router.get('/', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const media = await mediaController.getAllMedia();
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/media/upload — chỉ nhân viên (ảnh tiếp nhận / chứng từ)
// Chấp nhận file key là "file" hoặc "image" (tránh Unexpected field khi Postman dùng image như profile)
const mediaUpload = uploadImage.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

router.post('/upload', CheckLogin, checkRole('ADMIN', 'MODERATOR'), mediaUpload, async (req, res) => {
  try {
    const files = req.files || {};
    const file =
      (files.file && files.file[0]) ||
      (files.image && files.image[0]);
    if (!file) {
      return res.status(400).json({ message: 'Chưa có tệp ảnh được tải lên. Dùng form-data key là file hoặc image.' });
    }

    const media = await mediaController.createMedia({
      ticket: req.body.ticket,
      url: `/api/v1/upload/${file.filename}`,
      type: req.body.type,
      uploadedBy: req.user?._id
    });
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/media/ticket/:ticketId
router.get('/ticket/:ticketId', CheckLogin, async (req, res) => {
  try {
    const ticket = await repairTicketController.getTicketById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Không có quyền xem ảnh của phiếu này' });
    }
    const media = await mediaController.getMediaByTicketId(req.params.ticketId);
    res.json(media);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/media/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const media = await mediaController.getMediaById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    const ticket = await repairTicketController.getTicketById(media.ticket);
    if (!ticket || !repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Không có quyền xem ảnh này' });
    }
    res.json(media);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

// DELETE /api/v1/media/:id
router.delete('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const deleted = await mediaController.deleteMedia(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    res.json({ message: 'Xóa ảnh thành công.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
