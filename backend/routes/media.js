const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media');
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

// POST /api/v1/media/upload
router.post('/upload', CheckLogin, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: 'No file uploaded' });
    
    const media = await mediaController.createMedia({
      ticket: req.body.ticket,
      url: `/api/v1/upload/${req.file.filename}`,
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
    res.json({ message: 'Xoá ảnh thành công' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
