# Nhật Ký Phát Triển - Phân Tích Chuyên Sâu Frontend
**Ngày lập báo cáo:** 2026-05-09
**Người thực hiện:** Antigravity (AI)
**Thành phần đánh giá:** Thư mục `frontend/`

---

## 1. Vấn Đề Đồng Bộ Trạng Thái Đăng Nhập (State Sync & Auth)
### Mô tả vấn đề:
Trong file `frontend/src/services/api.js`, ở phần xử lý lỗi của `axios interceptors` (dòng 30-43), khi gặp mã lỗi `401 Unauthorized` (Token hết hạn hoặc không hợp lệ):
```javascript
if (error.response.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // window.location.href = '/login'; // Tùy chọn chuyển hướng
}
```
Việc xóa dữ liệu trong `localStorage` nhưng dòng chuyển hướng bị ẩn (comment) và không kích hoạt hành động làm mới State của React sẽ khiến `AuthContext` vẫn nghĩ người dùng đang đăng nhập (vì state trong bộ nhớ chưa thay đổi). Điều này dẫn đến tình trạng giao diện bị kẹt, người dùng bấm vào các tính năng khác sẽ liên tục báo lỗi do không có token.

### Giải pháp đề xuất:
Kích hoạt lại lệnh chuyển hướng hoặc tạo một hàm `logout` từ `AuthContext` và gọi nó thông qua một custom event hoặc sử dụng giải pháp quản lý state toàn cục để tự động điều hướng về trang `/login`.

---

## 2. Thẩm Mỹ Giao Diện (UI/UX Aesthetics) & Ant Design
### Mô tả vấn đề:
Dự án đang sử dụng thư viện Ant Design (`antd`) rất mạnh mẽ. Tuy nhiên, việc cấu hình trong `App.jsx` hiện tại mới dừng lại ở mức cơ bản (đổi màu chủ đạo sang mã teal `#0d9488`). 
- Giao diện nhìn chung còn mang tính mặc định của thư viện, chưa tạo được cảm giác "cao cấp" (Premium UI).
- Thiếu các hiệu ứng chiều sâu như Glassmorphism (nền kính mờ) cho các bảng điều khiển, thiếu các micro-animations (hiệu ứng chuyển động cực nhỏ khi hover hoặc tương tác) và các bóng đổ mượt mà (smooth shadows).

### Giải pháp đề xuất:
- Khai thác sâu hơn hệ thống Design Token của Ant Design 5.x.
- Thêm các lớp CSS tùy chỉnh vào `index.css` để định nghĩa lại các component như Card, Table, Modal theo phong cách hiện đại, sống động hơn.

---

## 3. Kiểm Tra Quyền Hạn Ở Route (Hardcoded Roles)
### Mô tả vấn đề:
Trong `App.jsx`, việc phân quyền cho các Route đang được hardcode cố định chuỗi `'ADMIN'` và `'MODERATOR'`:
```javascript
const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
if (roleName !== 'ADMIN') return <Navigate to="/" replace />;
```
Cách làm này đơn giản và chạy tốt cho dự án nhỏ. Tuy nhiên, nếu sau này hệ thống mở rộng thêm các quyền mới (ví dụ: `TECHNICIAN`, `ACCOUNTANT`), chúng ta sẽ phải đi sửa code ở rất nhiều nơi (các file Route).

### Giải pháp đề xuất:
Nâng cấp hệ thống phân quyền theo dạng mảng hoặc dựa trên quyền hạn (Permission-based) thay vì dựa trên Tên Quyền (Role-based) để tăng tính linh hoạt.

---

## 4. Kiểm Tra Tải File Ảnh Đại Diện
### Mô tả vấn đề:
Avatar của user đang được gán mặc định đến một link ảnh bên ngoài: `https://i.sstatic.net/l60Hf.png`. Việc phụ thuộc vào link ảnh ngoài có thể khiến giao diện bị lỗi hiển thị ảnh nếu đường link đó bị gãy hoặc bị chặn.

### Giải pháp đề xuất:
Nên lưu một file ảnh mặc định trong thư mục `public/` của frontend để đảm bảo tính sẵn sàng cao nhất.
