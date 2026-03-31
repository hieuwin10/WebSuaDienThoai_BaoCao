const express = require('express');
const router = express.Router();
const repairTicketController = require('../controllers/repairTickets');
const { CheckLogin, checkRole } = require('../utils/authHandler');
const mongoose = require('mongoose');

// GET /api/v1/repair-tickets
router.get('/', CheckLogin, async (req, res) => {
  try {
    const tickets = await repairTicketController.getAllTickets();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/repair-tickets/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const ticket = await repairTicketController.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(404).json({ message: 'ID không hợp lệ' });
  }
});

// POST /api/v1/repair-tickets
router.post('/', CheckLogin, async (req, res) => {
  try {
    const ticket = await repairTicketController.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/v1/repair-tickets/:id
router.put('/:id', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.updateTicket(req.params.id, req.body);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/v1/repair-tickets/:id/status
router.patch('/:id/status', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.updateStatus(req.params.id, req.body.status);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/v1/repair-tickets/:id/cancel
router.patch('/:id/cancel', CheckLogin, checkRole('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const ticket = await repairTicketController.cancelTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json({ message: 'Đã hủy phiếu thành công', ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/repair-tickets/:id
router.delete('/:id', CheckLogin, checkRole('ADMIN'), async (req, res) => {
  try {
    const ticket = await repairTicketController.deleteTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json({ message: 'Xóa phiếu thành công', ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
