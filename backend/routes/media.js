const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media');
const repairTicketController = require('../controllers/repairTickets'); // Dùng để kiểm tra quyền xem phiếu
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { uploadImage } = require('../utils/uploadHandler'); // Middleware xử lý upload (Multer)

/**
 * [GET] /api/v1/media
 * Lấy danh sách tất cả file media trong hệ thống (Chỉ dành cho Admin/Mod)
 */
router.get('/', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const media = await mediaController.getAllMedia();
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [POST] /api/v1/media/upload
 * Luồng tải lên ảnh: 
 * 1. Multer lưu file vào ổ cứng.
 * 2. MediaController lưu thông tin URL và ID phiếu vào MongoDB.
 */
const mediaUpload = uploadImage.fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

router.post('/upload', CheckLogin, checkRole('ADMIN', 'MODERATOR'), mediaUpload, async (req, res) => {
  try {
    const files = req.files || {};
    const file = (files.file && files.file[0]) || (files.image && files.image[0]);
    if (!file) {
      return res.status(400).json({ message: 'Chưa có tệp ảnh được tải lên. Dùng form-data key là file hoặc image.' });
    }

    // Sau khi file đã nằm trên ổ cứng, thực hiện lưu 'URL' truy cập vào Database
    const media = await mediaController.createMedia({
      ticket: req.body.ticket, // Gắn ID phiếu sửa chữa cho ảnh này
      url: `/api/v1/upload/${file.filename}`, // URL để xem ảnh từ xa
      type: req.body.type, // 'before' hoặc 'after'
      uploadedBy: req.user?._id // Lưu người thực hiện upload
    });
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/media/ticket/:ticketId
 * Lấy toàn bộ ảnh đính kèm của một phiếu sửa chữa cụ thể.
 */
router.get('/ticket/:ticketId', CheckLogin, async (req, res) => {
  try {
    const ticket = await repairTicketController.getTicketById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });

    // Kiểm tra bảo mật: Khách hàng chỉ được xem ảnh của CHÍNH phiếu của họ
    if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Không có quyền xem ảnh của phiếu này' });
    }
    const media = await mediaController.getMediaByTicketId(req.params.ticketId);
    res.json(media);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/media/:id
 * Lấy thông tin chi tiết một file media cụ thể.
 */
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const media = await mediaController.getMediaById(req.params.id);
    if (!media) return res.status(404).json({ message: 'Không tìm thấy ảnh' });

    const ticket = await repairTicketController.getTicketById(media.ticket);
    // Kiểm tra quyền xem ảnh thông qua phiếu sửa chữa liên quan
    if (!ticket || !repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
      return res.status(403).json({ message: 'Không có quyền xem ảnh này' });
    }
    res.json(media);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

/**
 * [DELETE] /api/v1/media/:id
 * Xóa một file media (Xóa cả DB và file thật trên ổ cứng)
 */
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
