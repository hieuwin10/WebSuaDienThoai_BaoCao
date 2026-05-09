const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media');
const repairTicketController = require('../controllers/repairTickets'); // Dùng để kiểm tra quyền xem phiếu
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { uploadImage } = require('../utils/uploadHandler'); // Middleware xử lý upload (Multer)

/**
 * [GET] /api/v1/media
 * Lấy danh sách tất cả file media trong hệ thống (Chỉ dành cho Admin/Mod)
 */
router.get('/', CheckLogin, checkRole('ADMIN', 'MODERATOR'), catchAsync(async (req, res) => {
  const media = await mediaController.getAllMedia();
  res.json(media);
}));

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

router.post('/upload', CheckLogin, checkRole('ADMIN', 'MODERATOR'), mediaUpload, catchAsync(async (req, res) => {
  const files = req.files || {};
  const file = (files.file && files.file[0]) || (files.image && files.image[0]);
  if (!file) {
    throw new AppError('Chưa có tệp ảnh được tải lên. Dùng form-data key là file hoặc image.', 400);
  }

  // Sau khi file đã nằm trên ổ cứng, thực hiện lưu 'URL' truy cập vào Database
  const media = await mediaController.createMedia({
    ticket: req.body.ticket, // Gắn ID phiếu sửa chữa cho ảnh này
    url: `/api/v1/upload/${file.filename}`, // URL để xem ảnh từ xa
    type: req.body.type, // 'before' hoặc 'after'
    uploadedBy: req.user?._id // Lưu người thực hiện upload
  });
  res.status(201).json(media);
}));

/**
 * [GET] /api/v1/media/ticket/:ticketId
 * Lấy toàn bộ ảnh đính kèm của một phiếu sửa chữa cụ thể.
 */
router.get('/ticket/:ticketId', CheckLogin, catchAsync(async (req, res) => {
  const ticket = await repairTicketController.getTicketById(req.params.ticketId);
  if (!ticket) {
    throw new AppError('Không tìm thấy phiếu', 404);
  }

  // Kiểm tra bảo mật: Khách hàng chỉ được xem ảnh của CHÍNH phiếu của họ
  if (!repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
    throw new AppError('Không có quyền xem ảnh của phiếu này', 403);
  }
  const media = await mediaController.getMediaByTicketId(req.params.ticketId);
  res.json(media);
}));

/**
 * [GET] /api/v1/media/:id
 * Lấy thông tin chi tiết một file media cụ thể.
 */
router.get('/:id', CheckLogin, catchAsync(async (req, res) => {
  const media = await mediaController.getMediaById(req.params.id);
  if (!media) {
    throw new AppError('Không tìm thấy ảnh', 404);
  }

  const ticket = await repairTicketController.getTicketById(media.ticket);
  // Kiểm tra quyền xem ảnh thông qua phiếu sửa chữa liên quan
  if (!ticket || !repairTicketController.assertUserCanViewTicket(req.user, ticket)) {
    throw new AppError('Không có quyền xem ảnh này', 403);
  }
  res.json(media);
}));

/**
 * [DELETE] /api/v1/media/:id
 * Xóa một file media (Xóa cả DB và file thật trên ổ cứng)
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), catchAsync(async (req, res) => {
  const deleted = await mediaController.deleteMedia(req.params.id);
  if (!deleted) {
    throw new AppError('Không tìm thấy ảnh', 404);
  }
  res.json({ message: 'Xóa ảnh thành công.' });
}));

module.exports = router;
