const serviceModel = require('../schemas/services');

module.exports = {
  // Thêm một loại dịch vụ mới vào danh mục
  createService: async (data) => {
    return await serviceModel.create(data);
  },
  // Lấy toàn bộ danh sách dịch vụ (ví dụ: Thay màn hình, Ép kính...)
  getAllServices: async () => {
    return await serviceModel.find();
  },
  // Tìm thông tin một dịch vụ theo ID
  getServiceById: async (id) => {
    return await serviceModel.findById(id);
  },
  // Cập nhật giá hoặc tên/mô tả của dịch vụ
  updateService: async (id, data) => {
    return await serviceModel.findByIdAndUpdate(id, data, { new: true });
  },
  // Xóa dịch vụ khỏi hệ thống
  deleteService: async (id) => {
    return await serviceModel.findByIdAndDelete(id);
  }
};
