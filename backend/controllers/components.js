const componentModel = require('../schemas/components');

module.exports = {
  // Thêm linh kiện mới vào danh mục kho
  createComponent: async (data) => {
    return await componentModel.create(data);
  },
  // Lấy toàn bộ danh sách linh kiện trong kho
  getAllComponents: async () => {
    return await componentModel.find();
  },
  // Xem chi tiết một linh kiện theo ID
  getComponentById: async (id) => {
    return await componentModel.findById(id);
  },
  // Cập nhật thông tin linh kiện (Tên, giá, SKU)
  updateComponent: async (id, data) => {
    return await componentModel.findByIdAndUpdate(id, data, { new: true });
  },
  // Xóa linh kiện khỏi kho
  deleteComponent: async (id) => {
    return await componentModel.findByIdAndDelete(id);
  },
  /**
   * Điều chỉnh số lượng kho:
   * Dùng $inc để cộng/trừ số lượng một cách an toàn (tránh lỗi khi nhiều người cùng cập nhật).
   */
  adjustStock: async (id, quantity) => {
    return await componentModel.findByIdAndUpdate(
      id, 
      { $inc: { stock_quantity: quantity } }, 
      { new: true }
    );
  }
};
