# Tài liệu Thiết kế Database - Website Quản lý Cửa hàng Sửa điện thoại

Tài liệu này hướng dẫn cách cài đặt và giải thích các model dữ liệu cho hệ thống.

## 1. Hướng dẫn cài đặt Docker

Để chạy MongoDB local bằng Docker, bạn chỉ cần mở terminal tại thư mục `Database` và chạy lệnh sau:

```bash
docker-compose up -d
```

Thông tin kết nối:
- **Username**: admin
- **Password**: password123
- **Port**: 27017
- **Database Name**: phone_repair_db (hoặc tùy chọn trong app.js)

## 2. Giải thích các Model (Mongoose)

Hệ thống bao gồm 9 collection chính:

### 1. Role (Quyền hạn)
- Quản lý các vai trò trong hệ thống như `admin`, `staff`, `customer`.
- Lưu trữ danh sách `permissions` để phân quyền chi tiết hơn.

### 2. User (Người dùng - Authen/Autho)
- Email (duy nhất), mật khẩu (đã hash).
- Tham chiếu tới `Role` thông qua `role_id`.

### 3. Profile (Thông tin cá nhân)
- Tách riêng để `User` model nhẹ hơn.
- Quan hệ 1:1 với `User`. Chứa `full_name`, `phone`, `address`, `avatar`.

### 4. Device (Thiết bị khách hàng)
- Lưu thông tin máy cần sửa (iPhone 15 Pro, S23 Ultra...).
- `imei` là trường duy nhất để tra cứu nhanh.

### 5. Service (Dịch vụ sửa chữa)
- Danh mục dịch vụ: Thay màn hình, ép kính, thay pin...
- Giá cơ bản và thời gian dự kiến.

### 6. Component (Linh kiện/Kho)
- Quản lý tồn kho linh kiện.
- Có mã `sku` và `stock_quantity`.

### 7. RepairTicket (Phiếu sửa chữa)
- **Model linh hồn**: Kết nối khách hàng, thiết bị, dịch vụ và linh kiện.
- Theo dõi trạng thái: `pending` -> `fixing` -> `completed` -> `canceled`.

### 8. Media (Hình ảnh/Video)
- Lưu bằng chứng tình trạng máy **Trước** và **Sau** khi sửa.

### 9. Warranty (Bảo hành)
- Tự động kích hoạt khi phiếu sửa hoàn thành.
- Thời gian bắt đầu và kết thúc bảo hành.

---
**Ghi chú**: Tất cả các model đều có `timestamps: true` để tự động lưu `createdAt` và `updatedAt`.

## 3. Hướng dẫn kết nối bằng MongoDB Compass

Để quản lý dữ liệu trực quan bằng MongoDB Compass, bạn làm theo các bước sau:

1. Mở **MongoDB Compass**.
2. Nhấn vào nút **"Add new connection"**.
3. Copy và dán chuỗi kết nối (URI) sau vào ô "Connection String":
   ```text
   mongodb://admin:password123@localhost:27017/?authSource=admin
   ```
4. Nhấn **Connect**.

**Lưu ý**: 
- `admin` và `password123` là thông tin tài khoản root đã cấu hình trong `docker-compose.yml`.
- `authSource=admin` là bắt buộc vì tài khoản admin được lưu trong database hệ thống của MongoDB.
