const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profiles');
const { CheckLogin } = require('../utils/authHandler');
const { uploadImage } = require('../utils/uploadHandler');

// GET /api/v1/profiles/me
router.get('/me', CheckLogin, async (req, res) => {
  try {
    const profile = await profileController.getProfileByUserId(req.user?._id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/profiles/:userId
router.get('/:userId', CheckLogin, async (req, res) => {
  try {
    const profile = await profileController.getProfileByUserId(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
  }
});

// PUT /api/v1/profiles/me
router.put('/me', CheckLogin, async (req, res) => {
  try {
    const profile = await profileController.updateProfileByUserId(req.user?._id, req.body);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/v1/profiles/upload-image
// Multer .single('image') → lỗi "Unexpected field" nếu client gửi field tên "file".
// Chấp nhận cả image và file (giống /media/upload).
const profileUpload = uploadImage.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

router.post('/upload-image', CheckLogin, profileUpload, async (req, res) => {
  try {
    const files = req.files || {};
    const file =
      (files.image && files.image[0]) ||
      (files.file && files.file[0]);
    if (!file) {
      return res.status(400).json({ message: 'Chưa có tệp ảnh được tải lên. Dùng form-data key là image hoặc file.' });
    }

    const imageUrl = `/api/v1/upload/${file.filename}`;
    const profile = await profileController.updateProfileImage(
      req.user?._id, 
      imageUrl, 
      req.body.type
    );
    
    res.json({
      message: 'Cập nhật ảnh thành công',
      imageUrl: imageUrl,
      profile: profile
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
