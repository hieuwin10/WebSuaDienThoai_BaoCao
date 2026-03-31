const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const { CheckLogin, checkRole } = require('../utils/authHandler');

router.get('/stats', CheckLogin, async (req, res) => {
  try {
    const stats = await dashboardController.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
