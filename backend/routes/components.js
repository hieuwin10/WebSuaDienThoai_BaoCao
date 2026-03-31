const express = require('express');
const router = express.Router();
const componentController = require('../controllers/components');
const { CheckLogin, checkRole } = require('../utils/authHandler');

// GET /api/v1/components
router.get('/', CheckLogin, async (req, res) => {
  try {
    const components = await componentController.getAllComponents();
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/components/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const component = await componentController.getComponentById(req.params.id);
    if (!component) return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
    res.json(component);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

// POST /api/v1/components
router.post('/', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const component = await componentController.createComponent(req.body);
    res.json(component);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/v1/components/:id
router.put('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const component = await componentController.updateComponent(req.params.id, req.body);
    if (!component) return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
    res.json(component);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/components/:id
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const component = await componentController.deleteComponent(req.params.id);
    if (!component) return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
    res.json({ message: 'Xóa linh kiện thành công', component });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// POST /api/v1/components/add-stock
router.post('/add-stock', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const component = await componentController.adjustStock(id, quantity);
    res.json(component);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
