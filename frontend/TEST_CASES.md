# Test Cases cho Giao diện Frontend (Chưa có Backend)

Tài liệu này liệt kê các kịch bản kiểm thử (Test Cases) cho giao diện người dùng, sử dụng dữ liệu giả lập (Mock Data) hoặc kiểm tra tính đúng đắn của giao diện khi không có kết nối backend.

## 1. Trang Bảng điều khiển (Dashboard)
- **TC1.1**: Kiểm tra hiển thị đầy đủ các thẻ thống kê (Thẻ phiếu, Thiết bị, Người dùng, Doanh thu).
- **TC1.2**: Kiểm tra hiển thị biểu đồ trạng thái và biểu đồ doanh thu (đảm bảo không bị vỡ khung).
- **TC1.3**: Kiểm tra hiển thị bảng "Phiếu sửa chữa gần đây" với dữ liệu giả lập.
- **TC1.4**: Kiểm tra phân quyền hiển thị (Admin thấy "Tổng số phiếu", User thường thấy "Phiếu của tôi").

## 2. Trang Quản lý thiết bị (DevicePage)
- **TC2.1**: Kiểm tra hiển thị danh sách thiết bị trong bảng (Model, Số sê-ri, Thương hiệu).
- **TC2.2**: Kiểm tra tính năng tìm kiếm theo số sê-ri hoặc model (lọc dữ liệu local).
- **TC2.3**: Kiểm tra mở Modal thêm thiết bị và hiển thị đầy đủ các trường nhập liệu.
- **TC2.4**: Kiểm tra hiển thị Modal xác nhận xóa khi bấm nút Xóa (AntD Modal.confirm).

## 3. Trang Quản lý dịch vụ & Linh kiện (ServiceManagementPage)
- **TC3.1**: Kiểm tra chuyển đổi giữa 2 tab "Dịch vụ" và "Linh kiện".
- **TC3.2**: Kiểm tra hiển thị Tag "Sắp hết" khi số lượng linh kiện < 5.
- **TC3.3**: Kiểm tra hiển thị Modal thêm/sửa dịch vụ/linh kiện với các trường tương ứng.

## 4. Trang Tra cứu bảo hành (WarrantyPage)
- **TC4.1**: Kiểm tra giao diện nhập số sê-ri / IMEI.
- **TC4.2**: Kiểm tra hiển thị thông tin bảo hành khi tìm thấy (dùng mock data).
- **TC4.3**: Kiểm tra hiển thị thông báo lỗi khi không tìm thấy thiết bị.

---
*Ghi chú: Các test case tự động mẫu đã được tạo trong file `src/pages/dashboard/Dashboard.test.jsx` sử dụng Vitest và React Testing Library.*
