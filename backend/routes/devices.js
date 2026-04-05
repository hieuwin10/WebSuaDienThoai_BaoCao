const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/devices');
const { CheckLogin, checkRole } = require('../utils/authHandler');
const { isStaff } = require('../utils/roleUtils');

// GET /api/v1/devices
router.get('/', CheckLogin, async (req, res) => {
  try {
    const devices = await deviceController.getDevicesForActor(req.user);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/devices/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const device = await deviceController.getDeviceById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    if (!isStaff(req.user)) {
      const owner = device.customer_id?._id || device.customer_id;
      if (!owner || String(owner) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Bạn không có quyền xem thiết bị này' });
      }
    }
    res.json(device);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

// POST /api/v1/devices — khách đăng ký máy: luôn gắn customer_id = chính họ
router.post('/', CheckLogin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (!isStaff(req.user)) {
      body.customer_id = req.user._id;
    }
    const device = await deviceController.createDevice(body);
    res.json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/v1/devices/:id
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const device = await deviceController.updateDevice(req.params.id, req.body);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/devices/:id
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const device = await deviceController.deleteDevice(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json({ message: 'Xóa thiết bị thành công.', device });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
