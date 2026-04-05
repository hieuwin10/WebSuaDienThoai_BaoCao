# Kịch bản test API (Postman) — yêu cầu cuối kì

Tài liệu gọn theo post yêu cầu: **CRUD**, **Authentication**, **Authorization**, **Upload**. Dùng để chạy thử và **chụp màn hình** đưa vào báo cáo.

---

## Biến môi trường Postman

| Biến | Ví dụ |
|------|--------|
| `BASE` | `http://localhost:5001/api/v1` |
| `token` | JWT sau khi đăng nhập (chuỗi text) |
| `token_admin` | Token user `admin` |
| `token_user` | Token user `customer1` |
| `service_id` | `_id` dịch vụ sau khi tạo hoặc lấy từ `GET /services` |

**Header xác thực (sau login):** `Authorization: Bearer {{token}}`

**Lưu ý:** `POST /auth/login` trả về **chuỗi JWT thuần** (body dạng text), không phải JSON `{ "token": "..." }`.

### Tự lưu token khi chạy Login (Postman Script)

1. Tạo **Environment** (hoặc dùng **Collection variables**), thêm biến `token` (giá trị để trống).
2. Mở request **POST** `/auth/login` → tab **Tests** (Postman cũ) hoặc **Scripts** → chạy **sau response** (Postman v10+).
3. Dán script sau — mỗi lần **Send** thành công, token được ghi vào biến môi trường `token`:

```javascript
// Body login là JWT thuần (text), không phải JSON
if (pm.response.code === 200) {
  const raw = pm.response.text().trim();
  if (raw) {
    pm.environment.set('token', raw);
    // Hoặc dùng biến collection: pm.collectionVariables.set('token', raw);
    console.log('Đã lưu token vào environment "token"');
  }
}
```

4. Các request khác dùng header: `Authorization` = `Bearer {{token}}` (chọn đúng **Environment** đã có biến `token`).

**Hai tài khoản (admin + user):** tạo hai request login (ví dụ `Login admin`, `Login customer1`), mỗi request một script khác biến:

- Admin: `pm.environment.set('token_admin', pm.response.text().trim());`
- User: `pm.environment.set('token_user', pm.response.text().trim());`

Rồi dùng `Bearer {{token_admin}}` hoặc `Bearer {{token_user}}` tùy kịch bản.

**Nếu sau này API đổi sang JSON** `{ "token": "..." }` thì đổi script thành:

```javascript
const json = pm.response.json();
pm.environment.set('token', json.token || json.access_token);
```

---

## Tài khoản mẫu (sau seed)

Mật khẩu mặc định: `password123`

| Username | Vai trò |
|----------|---------|
| `admin` | ADMIN |
| `staff1` | MODERATOR |
| `customer1` | USER |

---

## Body Raw JSON — copy vào Postman

Trong Postman: **Body** → chọn **raw** → dropdown bên phải chọn **JSON**. Dán nguyên khối dưới đây (chỉnh lại giá trị nếu cần).

### `POST {{BASE}}/auth/login`

```json
{
  "username": "admin",
  "password": "password123"
}
```

Ví dụ user khách:

```json
{
  "username": "customer1",
  "password": "password123"
}
```

### `POST {{BASE}}/auth/register`

Mật khẩu phải đủ mạnh (≥8 ký tự, có hoa, thường, số, ký tự đặc biệt). `username` chỉ chữ và số.

```json
{
  "username": "testuser01",
  "email": "testuser01@example.com",
  "password": "Abcd@1234",
  "fullName": "Nguyen Van Test"
}
```

### `POST {{BASE}}/auth/changepassword`

Cần Bearer token. `newpassword` cũng phải đủ mạnh như đăng ký.

```json
{
  "oldpassword": "password123",
  "newpassword": "Xyzab@9876"
}
```

### `POST {{BASE}}/auth/forgotpassword`

```json
{
  "email": "customer@repairsystem.com"
}
```

### `POST {{BASE}}/auth/resetpassword/{{reset_token}}`

`reset_token` là giá trị trong URL/email, không phải JWT đăng nhập.

```json
{
  "newpassword": "Abcd@1234"
}
```

### `PUT {{BASE}}/profiles/me`

```json
{
  "full_name": "Lê Văn Khách",
  "phone": "0909123456",
  "address": "Thủ Đức, TP.HCM"
}
```

### `POST {{BASE}}/services` (ADMIN hoặc MODERATOR — Bearer `{{token_admin}}` hoặc token `staff1`)

```json
{
  "name": "Test API dịch vụ",
  "description": "Demo CRUD Postman",
  "base_price": 100000,
  "estimated_time": "30 phút"
}
```

### `PUT {{BASE}}/services/{{service_id}}` (ADMIN hoặc MODERATOR)

```json
{
  "name": "Test API dịch vụ",
  "description": "Đã sửa mô tả",
  "base_price": 150000,
  "estimated_time": "45 phút"
}
```

### `POST {{BASE}}/users` (ADMIN — tạo user)

`role` là **ObjectId** MongoDB của bản ghi role (lấy từ `GET {{BASE}}/roles` hoặc Compass). Thay chuỗi dưới bằng ID thật.

```json
{
  "username": "nhanvienmoi",
  "email": "nhanvienmoi@example.com",
  "password": "Abcd@1234",
  "role": "PASTE_ROLE_OBJECT_ID_24_HEX_CHARS"
}
```

### `PUT {{BASE}}/users/{{user_id}}` (ADMIN — sửa user)

`password` là tùy chọn; nếu gửi thì phải đủ mạnh.

```json
{
  "fullName": "Ten Day Du Moi",
  "email": "emailmoi@example.com"
}
```

### `POST {{BASE}}/devices` (đã đăng nhập)

USER: server tự gắn `customer_id` là bạn. STAFF có thể gửi thêm `customer_id`.

```json
{
  "imei": "351234567890123",
  "brand": "Apple",
  "model_name": "iPhone 15",
  "color": "Đen",
  "condition_on_arrival": "Máy còn bảo hành, cần thay pin"
}
```

### `POST {{BASE}}/repair-tickets`

`device_id`, `services` (mảng ObjectId dịch vụ) là bắt buộc theo nghiệp vụ. Thay ID bằng giá trị từ `GET /devices` và `GET /services`.

```json
{
  "ticket_code": "PT-POSTMAN-001",
  "device_id": "PASTE_DEVICE_OBJECT_ID",
  "services": ["PASTE_SERVICE_OBJECT_ID"],
  "status": "pending",
  "total_cost": 500000,
  "note": "Khách báo hỏng loa"
}
```

### `PATCH {{BASE}}/repair-tickets/{{ticket_id}}/status` (ADMIN / MODERATOR)

```json
{
  "status": "fixing"
}
```

Giá trị `status` hợp lệ: `pending`, `fixing`, `completed`, `canceled`, `ready_for_pickup`.

### `POST {{BASE}}/components/add-stock` (ADMIN)

```json
{
  "id": "PASTE_COMPONENT_OBJECT_ID",
  "quantity": 5
}
```

### `POST {{BASE}}/warranty` (ADMIN / MODERATOR)

```json
{
  "ticket": "PASTE_TICKET_OBJECT_ID",
  "startDate": "2026-04-05T00:00:00.000Z",
  "endDate": "2026-10-05T00:00:00.000Z",
  "note": "Bảo hành 6 tháng linh kiện"
}
```

---

**Không dùng Raw JSON (dùng form-data):**

| Request | Cách nhập |
|---------|-----------|
| `POST .../profiles/upload-image` | Body → **form-data**: **`image`** hoặc **`file`** = File (đúng một key chứa ảnh); `type` = Text `avatar` hoặc `cover`. Lỗi **Unexpected field** = tên key file sai (vd. dùng `file` khi server chỉ nhận `image` — backend đã hỗ trợ cả hai). |
| `POST .../media/upload` | **form-data**: **`file`** hoặc **`image`** = File; `ticket` = Text (ObjectId phiếu); `type` = Text (mô tả loại ảnh — bật checkbox dòng này). |

---

## 1. Authentication (đăng nhập / đăng ký)

| # | Mô tả | Request |
|---|--------|---------|
| 1.1 | Đăng ký (tùy chọn) | `POST {{BASE}}/auth/register` — JSON: `username`, `email`, `password` (mật khẩu mạnh: ≥8 ký tự, hoa/thường/số/ký tự đặc biệt, ví dụ `Abcd@1234`), `fullName` |
| 1.2 | Đăng nhập | `POST {{BASE}}/auth/login` — `{ "username": "admin", "password": "password123" }` |
| 1.3 | Kiểm tra phiên | `GET {{BASE}}/auth/me` — Bearer token | 200, có `role`, `profile` (avatar, …) |

**Gợi ý chụp hình báo cáo:** response **1.2** (200 + token), **1.3** (200 + JSON user).

---

## 2. Authorization (phân quyền)

| # | Mô tả | Request | Kỳ vọng |
|---|--------|---------|---------|
| 2.1 | Admin/Moderator xem danh sách user | `GET {{BASE}}/users` — Bearer **admin** hoặc **staff1** | **200** |
| 2.2 | Khách không được danh sách | `GET {{BASE}}/users` — Bearer **customer1** | **403** |

*(Trước đây `GET /users/:id` không chặn — USER có thể tra cứu bất kỳ id; backend đã siết: USER chỉ được id trùng `req.user._id`.)*

**Gợi ý chụp hình:** **2.1** vs **2.2**; thêm **2.4** (403 khi lấy nhầm id người khác).

---

## 3. CRUD (ví dụ: dịch vụ `/services`)

- **Đọc** `GET /services`, `GET /services/:id`: mọi tài khoản **đã đăng nhập** (kể cả USER).
- **Tạo / Sửa** `POST`, `PUT`: chỉ **ADMIN** hoặc **MODERATOR** (`staff1`).
- **Xóa** `DELETE`: chỉ **ADMIN** (khách và nhân viên thường không xóa danh mục).

Dùng Bearer `{{token_admin}}` hoặc token **staff1** cho **3.1**, **3.4**; **3.5** chỉ **admin**.

| # | Thao tác | Method | URL | Body JSON (gợi ý) |
|---|----------|--------|-----|-------------------|
| 3.1 | **Create** | `POST` | `{{BASE}}/services` | `{ "name": "Test API dịch vụ", "description": "Demo CRUD", "base_price": 100000, "estimated_time": "30 phút" }` |
| 3.2 | **Read** (danh sách) | `GET` | `{{BASE}}/services` | — |
| 3.4 | **Update** | `PUT` | `{{BASE}}/services/{{service_id}}` | Sửa `base_price` hoặc `description` |
| 3.5 | **Delete** | `DELETE` | `{{BASE}}/services/{{service_id}}` | — |

**Kiểm tra phân quyền:** Bearer **customer1** → `POST` / `PUT` → **403**; `DELETE` → **403**. Bearer **staff1** → `POST` / `PUT` **200**; `DELETE` → **403** (nếu muốn minh chứng xóa chỉ admin).

**Gợi ý chụp hình:** Create (admin/staff), Read (user được phép), **403** POST với user.

---

## 4. Upload file

| # | Mô tả | Request |
|---|--------|---------|
| 4.1 | Ảnh đại diện / ảnh bìa hồ sơ | `POST {{BASE}}/profiles/upload-image` — **form-data**: file ảnh với key **`image`** hoặc **`file`**; text **`type`**: `avatar` hoặc `cover`. Không set thủ công `Content-Type`. |
| 4.2 | Ảnh đính kèm phiếu (nhân viên) | `POST {{BASE}}/media/upload` — **form-data**: **`file`** hoặc **`image`** = ảnh; **`ticket`** = id phiếu; **`type`** = text (vd. `reception`) — nhớ **bật** cả 3 dòng. Bearer **admin** / **staff1**. |

**Gợi ý chụp hình:** response **200** của 4.1 (có `imageUrl`, `profile`) hoặc **201** của 4.2.

---

## 5. Ánh xạ yêu cầu đồ án → minh chứng Postman

| Yêu cầu | Minh chứng |
|----------|------------|
| **Authentication** | Login (`/auth/login`) + `/auth/me` |
| **Authorization** | `GET /users` (admin vs user); `GET /users/:id` (user chỉ được chính mình) |
| **CRUD** | `/services`: đọc mọi user đăng nhập; ghi (POST/PUT) admin/mod; xóa chỉ admin — tương tự tinh thần với `/components` (chỉ admin ghi) |
| **Upload** | `/profiles/upload-image` và/hoặc `/media/upload` |

---

## 6. Gợi ý liên hệ số model (theo đề)

Hệ thống có nhiều tập dữ liệu (MongoDB / Mongoose), ví dụ: **user**, **role**, **profile**, **device**, **service**, **component**, **repairTicket**, **warranty**, **media**. Trong báo cáo có thể liệt kê từng model và gắn với ít nhất một API đã test (đọc hoặc CRUD).

---

*Tạo/cập nhật: phục vụ báo cáo cuối kì — tối đa 2 trang slide có thể trích phần bảng 1–4 và ảnh chụp Postman tương ứng.*
