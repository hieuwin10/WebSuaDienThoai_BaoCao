const warrantyModel = require('../schemas/warranty');
const repairTicketModel = require('../schemas/repairTickets');
const deviceModel = require('../schemas/devices');
const { isStaff } = require('../utils/roleUtils');

// Cấu hình để lấy nhanh thông tin phiếu và thiết bị khi xem bảo hành

/**
 * Cấu hình truy vấn liên thông (Deep Populate) cho Bảo hành.
 * Đây là kỹ thuật "Nhảy tầng" dữ liệu trong MongoDB:
 * Warranty (Bảo hành) -> RepairTicket (Phiếu sửa) -> Device (Thiết bị)
 */
const TICKET_POPULATE_MIN = {
  path: 'ticket', // Tầng 1: Nhảy sang bảng RepairTickets (Phiếu sửa chữa)
  select: 'ticket_code device_id status', // Chỉ lấy 3 trường này từ phiếu sửa chữa

  // Tầng 2: Từ RepairTickets nhảy tiếp sang bảng Devices (Thiết bị)
  populate: {
    path: 'device_id',
    model: 'device', // Chỉ rõ model đích để Mongoose không bị nhầm lẫn
    select: 'customer_id brand model_name imei' // Chỉ lấy thông tin máy và ID khách hàng
  },
};

module.exports = {
  // Tạo bản ghi bảo hành mới
  createWarranty: async (data) => {
    return await warrantyModel.create(data);
  },
  // Lấy tất cả thông tin bảo hành trong hệ thống
  getAllWarranties: async () => {
    return await warrantyModel.find().populate(TICKET_POPULATE_MIN);
  },

  /**
   * Hàm lọc bảo hành theo người dùng đang đăng nhập:
   * 1. Lấy danh sách ID thiết bị của khách hàng.
   * 2. Lấy danh sách ID phiếu sửa chữa của các thiết bị đó.
   * 3. Tìm các bản ghi bảo hành khớp với các phiếu trên.
   */
  getWarrantiesForActor: async (user) => {
    if (isStaff(user)) {
      return await warrantyModel.find().populate(TICKET_POPULATE_MIN);
    }
    // Bước 1: Tìm ID máy của khách
    const deviceIds = await deviceModel.find({ customer_id: user._id }).distinct('_id');
    // Bước 2: Tìm ID phiếu của máy đó
    const ticketIds = await repairTicketModel.find({ device_id: { $in: deviceIds } }).distinct('_id');
    if (!ticketIds.length) return [];
    // Bước 3: Trả về các bản ghi bảo hành tương ứng
    return await warrantyModel.find({ ticket: { $in: ticketIds } }).populate(TICKET_POPULATE_MIN);
  },

  // Tìm kiếm bảo hành theo ID
  getWarrantyById: async (id) => {
    return await warrantyModel.findById(id).populate(TICKET_POPULATE_MIN);
  },
  // Cập nhật ngày hết hạn hoặc ghi chú bảo hành
  updateWarranty: async (id, data) => {
    return await warrantyModel.findByIdAndUpdate(id, data, { new: true });
  },
  // Xóa bản ghi bảo hành
  deleteWarranty: async (id) => {
    return await warrantyModel.findByIdAndDelete(id);
  },
  // Tìm kiếm bảo hành dựa trên danh sách ID phiếu sửa chữa
  searchByTicket: async (ticketIds) => {
    return await warrantyModel.find({ ticket: { $in: ticketIds } }).populate('ticket');
  }
};
