const roleModel = require('../schemas/roles');

module.exports = {
  // Tạo quyền mới
  createRole: async (data) => {
    return await roleModel.create(data);
  },
  // Lấy danh sách các quyền chưa bị xóa
  getAllRoles: async () => {
    return await roleModel.find({ isDeleted: false });
  },
  // Lấy chi tiết một quyền theo ID
  getRoleById: async (id) => {
    return await roleModel.findOne({ _id: id, isDeleted: false });
  },
  // Cập nhật tên hoặc mô tả quyền
  updateRole: async (id, data) => {
    return await roleModel.findByIdAndUpdate(id, data, { new: true });
  },
  /**
   * Xóa quyền: Không xóa thật khỏi DB mà chỉ đánh dấu isDeleted = true (Xóa mềm)
   */
  deleteRole: async (id) => {
    return await roleModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
};
