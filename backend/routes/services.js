const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/services');
const { CheckLogin, checkRole } = require('../utils/authHandler');

// GET /api/v1/services
router.get('/', CheckLogin, async (req, res) => {
  try {
    const services = await serviceController.getAllServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/services/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const service = await serviceController.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json(service);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

// POST /api/v1/services
router.post('/', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const service = await serviceController.createService(req.body);
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/v1/services/:id
router.put('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const service = await serviceController.updateService(req.params.id, req.body);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/services/:id
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const service = await serviceController.deleteService(req.params.id);
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Xoá dịch vụ thành công', service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
