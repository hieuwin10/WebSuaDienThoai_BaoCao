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
router.post('/upload-image', CheckLogin, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: 'No file uploaded' });
    
    const imageUrl = `/api/v1/upload/${req.file.filename}`;
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
