const deviceModel = require('../schemas/devices');
const { isStaff: isStaffUser } = require('../utils/roleUtils');

module.exports = {
  // Thêm thiết bị mới vào database
  createDevice: async (data) => {
    return await deviceModel.create(data);
  },

  // Hàm quan trọng: Lấy danh sách thiết bị dựa trên "vai trò" (Actor)
  getDevicesForActor: async (user) => {
    // Nếu là nhân viên (Staff/Admin): Cho phép xem TẤT CẢ thiết bị của mọi khách hàng
    if (isStaffUser(user)) {
      return await deviceModel.find().populate('customer_id');
    }
    // Nếu là khách hàng thường: Chỉ cho phép xem thiết bị của CHÍNH HỌ
    return await deviceModel.find({ customer_id: user._id }).populate('customer_id');
  },

  // Lấy tất cả thiết bị (thường dùng cho các báo cáo nội bộ)
  getAllDevices: async () => {
    return await deviceModel.find().populate('customer_id');
  },

  // Tìm chi tiết một thiết bị theo ID
  getDeviceById: async (id) => {
    return await deviceModel.findById(id).populate('customer_id');
  },

  // Cập nhật thông tin thiết bị (ví dụ sửa sai IMEI, đổi model máy...)
  updateDevice: async (id, data) => {
    return await deviceModel.findByIdAndUpdate(id, data, { new: true });
  },

  // Xóa vĩnh viễn thiết bị khỏi database
  deleteDevice: async (id) => {
    return await deviceModel.findByIdAndDelete(id);
  }
};
