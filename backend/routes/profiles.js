const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profiles');
// Middleware xác thực và xử lý Upload ảnh
const { CheckLogin } = require('../utils/authHandler');
const { uploadImage } = require('../utils/uploadHandler');

/**
 * [GET] /api/v1/profiles/me
 * Xem thông tin hồ sơ của CHÍNH NGƯỜI ĐANG ĐĂNG NHẬP.
 */
router.get('/me', CheckLogin, async (req, res) => {
  try {
    const profile = await profileController.getProfileByUserId(req.user?._id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * [GET] /api/v1/profiles/:userId
 * Xem thông tin hồ sơ của một người dùng bất kỳ (Thường dùng cho trang cá nhân của người khác).
 */
router.get('/:userId', CheckLogin, async (req, res) => {
  try {
    const profile = await profileController.getProfileByUserId(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
  }
});

/**
 * [PUT] /api/v1/profiles/me
 * Cập nhật thông tin cá nhân của người đang đăng nhập.
 */
router.put('/me', CheckLogin, async (req, res) => {
  try {
    const profile = await profileController.updateProfileByUserId(req.user?._id, req.body);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * [POST] /api/v1/profiles/upload-image
 * API chuyên dụng để tải lên ảnh đại diện hoặc ảnh bìa.
 * Hỗ trợ linh hoạt: nhận cả key 'image' hoặc 'file' từ Frontend.
 */
const profileUpload = uploadImage.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

router.post('/upload-image', CheckLogin, profileUpload, async (req, res) => {
  try {
    const files = req.files || {};
    // Ưu tiên lấy file từ key 'image', nếu không có thì lấy từ 'file'
    const file =
      (files.image && files.image[0]) ||
      (files.file && files.file[0]);
      
    if (!file) {
      return res.status(400).json({ message: 'Chưa có tệp ảnh được tải lên. Dùng form-data key là image hoặc file.' });
    }

    const imageUrl = `/api/v1/upload/${file.filename}`;
    
    // Lưu đường dẫn ảnh vào Database (type có thể là 'avatar' hoặc 'cover')
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
