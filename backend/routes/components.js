const express = require('express');
const router = express.Router();
const componentController = require('../controllers/components');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
// Middleware bảo mật
const { CheckLogin, checkRole } = require('../utils/authHandler');

/**
 * [GET] /api/v1/components
 * Xem danh sách linh kiện trong kho (Nhân viên có thể xem).
 */
router.get('/', CheckLogin, catchAsync(async (req, res) => {
  const components = await componentController.getAllComponents();
  res.json(components);
}));

/**
 * [GET] /api/v1/components/:id
 * Xem chi tiết thông số và giá của 1 loại linh kiện.
 */
router.get('/:id', CheckLogin, catchAsync(async (req, res) => {
  const component = await componentController.getComponentById(req.params.id);
  if (!component) {
    throw new AppError('Không tìm thấy linh kiện', 404);
  }
  res.json(component);
}));

/**
 * [POST] /api/v1/components
 * Tạo linh kiện mới (Chỉ Admin mang quyền quản trị tối cao mới được tạo).
 */
router.post('/', CheckLogin, checkRole('ADMIN'), catchAsync(async (req, res) => {
  const component = await componentController.createComponent(req.body);
  res.json(component);
}));

/**
 * [PUT] /api/v1/components/:id
 * Cập nhật thông tin linh kiện.
 */
router.put('/:id', CheckLogin, checkRole('ADMIN'), catchAsync(async (req, res) => {
  const component = await componentController.updateComponent(req.params.id, req.body);
  if (!component) {
    throw new AppError('Không tìm thấy linh kiện', 404);
  }
  res.json(component);
}));

/**
 * [DELETE] /api/v1/components/:id
 * Xóa linh kiện khỏi kho dữ liệu.
 */
router.delete('/:id', CheckLogin, checkRole('ADMIN'), catchAsync(async (req, res) => {
  const component = await componentController.deleteComponent(req.params.id);
  if (!component) {
    throw new AppError('Không tìm thấy linh kiện', 404);
  }
  res.json({ message: 'Xóa linh kiện thành công', component });
}));

/**
 * [POST] /api/v1/components/add-stock
 * API Chuyên dụng để nhập hàng vào kho (Cộng thêm số lượng).
 */
router.post('/add-stock', CheckLogin, checkRole('ADMIN'), catchAsync(async (req, res) => {
  const { id, quantity } = req.body;
  if (quantity <= 0) {
    throw new AppError('Số lượng phải lớn hơn 0', 400);
  }
  const component = await componentController.adjustStock(id, quantity);
  res.json(component);
}));

module.exports = router;
