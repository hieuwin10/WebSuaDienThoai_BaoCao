const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
// Import các Middleware bảo vệ: CheckLogin (phải đăng nhập) và checkRole (kiểm tra quyền)
const { CheckLogin, checkRole } = require('../utils/authHandler');

/**
 * [GET] /api/v1/dashboard/stats
 * Lấy các số liệu thống kê tổng quát cho trang Dashboard.
 * Route này được bảo vệ bởi CheckLogin (yêu cầu người dùng phải có Token hợp lệ).
 */
router.get('/stats', CheckLogin, async (req, res) => {
  try {
    // Gọi hàm xử lý tính toán từ Controller
    const stats = await dashboardController.getStats();
    // Trả về kết quả dưới dạng JSON cho Frontend
    res.json(stats);
  } catch (err) {
    // Xử lý lỗi nếu quá trình truy vấn Database gặp trục trặc
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
