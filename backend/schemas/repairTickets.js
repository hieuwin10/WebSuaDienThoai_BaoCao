const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho bảng RepairTickets (Phiếu sửa chữa)
// Đây là model trung tâm kết nối thiết bị, dịch vụ và linh kiện.
const repairTicketSchema = new mongoose.Schema({
  // Mã phiếu (ví dụ: SC001) - phải là duy nhất
  ticket_code: {
    type: String,
    required: true,
    unique: true
  },
  // ID của thiết bị cần sửa chữa
  device_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device',
    required: true
  },
  // Danh sách các dịch vụ áp dụng cho phiếu này (ví dụ: Thay màn hình, Vệ sinh máy)
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'service'
  }],
  // Danh sách các linh kiện đã sử dụng và số lượng tương ứng
  components_used: [{
    component_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'component'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  // Trạng thái của phiếu sửa chữa
  status: {
    type: String,
    enum: ['pending', 'fixing', 'completed', 'canceled', 'ready_for_pickup'],
    default: 'pending'
  },
  // Kỹ thuật viên phụ trách sửa chữa phiếu này
  technician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  // Tổng chi phí cuối cùng của phiếu sửa chữa
  total_cost: {
    type: Number,
    default: 0
  },
  // Ghi chú thêm về tình trạng hoặc yêu cầu của khách
  note: {
    type: String
  }
}, { 
  // Lưu thời gian tạo và cập nhật phiếu
  timestamps: true 
});

module.exports = mongoose.model('repairTicket', repairTicketSchema);
