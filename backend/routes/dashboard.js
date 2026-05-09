const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const catchAsync = require('../utils/catchAsync');
// Import các Middleware bảo vệ: CheckLogin (phải đăng nhập) và checkRole (kiểm tra quyền)
const { CheckLogin } = require('../utils/authHandler');

/**
 * [GET] /api/v1/dashboard/stats
 * Lấy các số liệu thống kê tổng quát cho trang Dashboard.
 * Route này được bảo vệ bởi CheckLogin (yêu cầu người dùng phải có Token hợp lệ).
 */
router.get('/stats', CheckLogin, catchAsync(async (req, res) => {
  const stats = await dashboardController.getStats();
  res.json(stats);
}));

module.exports = router;
