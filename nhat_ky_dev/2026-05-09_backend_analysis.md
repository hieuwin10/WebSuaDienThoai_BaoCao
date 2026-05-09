# Nhật Ký Phát Triển - Phân Tích Chuyên Sâu Backend
**Ngày lập báo cáo:** 2026-05-09
**Người thực hiện:** BMAD Analyst (AI)
**Thành phần đánh giá:** Thư mục `backend/`

---

## 1. Rủi ro toàn vẹn dữ liệu (Thiếu ACID / Transactions)
### Mô tả vấn đề:
Trong file `backend/controllers/repairTickets.js`, các hàm như `createTicket` hoặc `updateStatus` đang thay đổi dữ liệu của 3 bảng khác nhau:
1. Tạo phiếu sửa chữa (`repairTicketModel`)
2. Trừ/Cộng số lượng linh kiện trong kho (`componentModel`)
3. Tạo phiếu bảo hành 6 tháng (`warrantyModel`)

Tất cả các lệnh lưu (`.save()`, `.findByIdAndUpdate()`) đều chạy hoàn toàn độc lập với nhau. Nếu hệ thống mạng chập chờn, hoặc quá trình lưu `warrantyModel` gặp lỗi thì `componentModel` đã bị trừ đi số lượng mà không được khôi phục (rollback).

### Giải pháp đề xuất:
Sử dụng `mongoose.startSession()` và bọc tất cả các thay đổi vào trong `session.withTransaction()`. Nếu có lỗi ném ra (throw error), Mongoose sẽ tự động rollback dữ liệu kho linh kiện.

---

## 2. Lỗi nạp Biến Môi Trường (Dotenv)
### Mô tả vấn đề:
Lệnh `require('dotenv').config()` ở đầu file `backend/app.js` được cấu hình mặc định (không truyền path). Khi sử dụng package `concurrently` ở cấp độ thư mục root (`WebSuaDienThoai_BaoCao`) để chạy lệnh `npm run dev`, script Node.js chạy với thư mục hiện hành là thư mục gốc, khiến `dotenv` tìm file `.env` ở root thay vì ở trong thư mục `backend/`. Kết quả là `MONGO_URI` bị `undefined`, gây lỗi ngắt kết nối CSDL liên tục.

### Giải pháp đề xuất:
Chỉnh sửa file `backend/app.js`:
```javascript
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
```

---

## 3. "Rác" kiến trúc (Anti-pattern Mixed Rendering)
### Mô tả vấn đề:
Toàn bộ dự án đã được phân rã kiến trúc rõ ràng giữa Client (thư mục `frontend/` - React Vite) và Server (thư mục `backend/` - REST API). Tuy nhiên, `backend/` hiện tại vẫn còn giữ nguyên khai báo `app.set('view engine', 'ejs');` và đi kèm một thư mục khổng lồ `backend/views/` chứa các giao diện html/ejs cũ (như `categories.ejs`, `products.ejs`). Các giao diện này không được sử dụng nhưng gây phình to mã nguồn và làm rối luồng đọc code.

### Giải pháp đề xuất:
- Gỡ bỏ thư viện `ejs` ra khỏi `package.json` của backend.
- Xóa thư mục `backend/views/`.
- Xóa các cài đặt view engine trong `app.js`.

---

## 4. Lỗ hổng Bảo Mật (Security & CORS)
### Mô tả vấn đề:
- **CORS mở toàn cầu:** `app.use(cors())` mặc định cho phép bất kỳ domain nào truy cập lấy dữ liệu của API, tạo nguy cơ lộ dữ liệu nội bộ.
- **Thiếu lớp phòng thủ API:** Ứng dụng chưa có các Middleware ngăn chặn tấn công từ chối dịch vụ (DDoS) cơ bản hoặc chống brute-force (đoán mật khẩu liên tục).
- **Validation Dữ liệu yếu:** Multer nhận file upload nhưng chưa validate kĩ giới hạn dung lượng hoặc loại tệp (MIME types).

### Giải pháp đề xuất:
- Thêm giới hạn nguồn gọi API: `app.use(cors({ origin: 'http://localhost:5173' }));`
- Bổ sung các thư viện bảo mật tiêu chuẩn: `helmet`, `express-rate-limit`, `mongo-sanitize`.

---

## 5. Chuẩn hóa Error Handling yếu
### Mô tả vấn đề:
Các lỗi bất đồng bộ (Async Errors) chưa được xử lý triệt để. Nếu một hàm trong Controller gặp lỗi mà không có `try...catch`, Promise sẽ bị Unhandled và có nguy cơ làm sập (crash) hệ thống Node.js. Các message trả về cũng khá thô sơ với một hàm bắt lỗi cục bộ cuối file `app.js`.

### Giải pháp đề xuất:
- Tạo thư mục `backend/middlewares` và xây dựng một `errorHandler.js` riêng.
- Tạo một Class `AppError` kế thừa từ `Error` để dễ dàng bắt các lỗi có hệ thống như lỗi MongoDB Cast Error (Sai ID), lỗi JWT Hết hạn, lỗi Validate, v.v.
