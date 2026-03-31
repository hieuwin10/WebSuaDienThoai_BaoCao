const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warranty');
const repairTicketController = require('../controllers/repairTickets');
const { CheckLogin, checkRole } = require('../utils/authHandler');

// GET /api/v1/warranty
router.get('/', CheckLogin, async (req, res) => {
  try {
    const warranties = await warrantyController.getAllWarranties();
    res.json(warranties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/warranty/search
router.get('/search', CheckLogin, async (req, res) => {
  try {
    const q = req.query.q;
    // For simple search, find tickets first then warranties
    const tickets = await repairTicketController.getAllTickets(); // Use a better query in production
    const matchedTicketIds = tickets.filter(t => 
        t.ticket_code.includes(q) || t.device_id?.brand.includes(q)
    ).map(t => t._id);

    const result = await warrantyController.searchByTicket(matchedTicketIds);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/warranty/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const warranty = await warrantyController.getWarrantyById(req.params.id);
    if (!warranty) return res.status(404).json({ message: 'Không tìm thấy bảo hành' });
    res.json(warranty);
  } catch (err) {
    res.status(404).send('ID không hợp lệ');
  }
});

// POST /api/v1/warranty
router.post('/', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const warranty = await warrantyController.createWarranty(req.body);
    res.status(201).json(warranty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/v1/warranty/:id
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const updated = await warrantyController.updateWarranty(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy bảo hành' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/warranty/:id
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const deleted = await warrantyController.deleteWarranty(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy bảo hành' });
    res.json({ message: 'Xoá bảo hành thành công', warranty: deleted });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
