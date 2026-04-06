// Import các models cần thiết để truy vấn dữ liệu từ database
const repairTicketModel = require('../schemas/repairTickets');
const userModel = require('../schemas/users');
const componentModel = require('../schemas/components');

module.exports = {
  // Hàm getStats: Tổng hợp và tính toán các số liệu thống kê cho Dashboard
  getStats: async () => {
    // 1. Lấy toàn bộ dữ liệu thô từ Database
    let tickets = await repairTicketModel.find(); // Lấy tất cả phiếu sửa chữa
    let users = await userModel.find({ isDeleted: false }); // Lấy người dùng chưa bị xóa
    let components = await componentModel.find(); // Lấy tất cả linh kiện trong kho

    // Khởi tạo các biến đếm và doanh thu
    let pendingTickets = 0;
    let fixingTickets = 0;
    let completedTickets = 0;
    let revenue = 0;

    // 2. Chạy vòng lặp qua từng phiếu sửa chữa để phân loại trạng thái và tính tiền
    for (const ticket of tickets) {
      if (ticket.status === 'pending') {
        pendingTickets += 1; // Đếm số phiếu đang chờ nhận máy/kiểm tra
      }

      if (ticket.status === 'fixing') {
        fixingTickets += 1; // Đếm số máy thợ đang tiến hành sửa chữa
      }

      // Đếm số phiếu đã hoàn thành hoặc máy đã sẵn sàng để khách đến lấy
      if (ticket.status === 'completed' || ticket.status === 'ready_for_pickup') {
        completedTickets += 1;
      }

      // Cộng dồn doanh thu chỉ từ những phiếu đã hoàn thành (completed)
      if (ticket.status === 'completed') {
        revenue += ticket.total_cost || 0; // Nếu không có giá trị total_cost, mặc định lấy 0
      }
    }

    // 3. Kiểm tra số lượng linh kiện sắp hết (dưới 5 món) để cảnh báo nhập hàng
    let lowStockItems = 0;
    for (const component of components) {
      if (component.stock_quantity < 5) {
        lowStockItems += 1;
      }
    }

    // 4. Đóng gói kết quả thành một đối tượng JSON để gửi về cho Frontend
    let stats = {
      totalTickets: tickets.length, // Tổng số phiếu đã tiếp nhận
      pendingTickets,               // Phiếu chờ
      fixingTickets,                // Phiếu đang sửa
      completedTickets,             // Phiếu hoàn tất
      totalUsers: users.length,     // Tổng số khách hàng/nhân viên
      lowStockItems,                // Số linh kiện sắp hết hàng
      revenue                       // Tổng doanh thu thực tế
    };

    return stats; // Trả về bộ số liệu thống kê cho Route/Controller gọi hàm này
  }
};
