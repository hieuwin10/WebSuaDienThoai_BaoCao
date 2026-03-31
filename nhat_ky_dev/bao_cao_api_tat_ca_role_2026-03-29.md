# Tong Hop API Theo Role (ADMIN, MODERATOR, USER) - 2026-03-29

Base URL: `http://localhost:5001/api/v1`

## 1. Role va pham vi
- `ADMIN`: toan quyen he thong.
- `MODERATOR`: van hanh ky thuat (xu ly phieu, bao hanh, media, thiet bi), khong co quyen quan tri cao nhat.
- `USER`: khach hang (dung API tai khoan + tao yeu cau sua chua, xem du lieu can thiet).

## 2. Ma tran quyen API (thuc te da test)
Quy uoc:
- `Y`: duoc phep
- `N`: khong duoc phep (403)
- `~`: co dieu kien/chi dung cho test case dac biet

| Nhom | Endpoint | ADMIN | MODERATOR | USER |
|---|---|---:|---:|---:|
| Auth | POST `/auth/login` | Y | Y | Y |
| Auth | POST `/auth/register` | Y | Y | Y |
| Auth | GET `/auth/me` | Y | Y | Y |
| Auth | POST `/auth/changepassword` | Y | Y | Y |
| Auth | POST `/auth/forgotpassword` | Y | Y | Y |
| Auth | POST `/auth/resetpassword/:token` | Y | Y | Y |
| Auth | POST `/auth/logout` | Y | Y | Y |
| Users | GET `/users` | Y | Y | N |
| Users | GET `/users/:id` | Y | Y | Y |
| Users | POST `/users` | Y | N | N |
| Users | PUT `/users/:id` | Y | N | N |
| Users | DELETE `/users/:id` | Y | N | N |
| Users | PATCH `/users/:id/lock` | Y | N | N |
| Roles | GET `/roles` | Y | N | N |
| Roles | POST `/roles` | Y | N | N |
| Roles | PUT `/roles/:id` | Y | N | N |
| Roles | DELETE `/roles/:id` | Y | N | N |
| Components | GET `/components` | Y | Y | Y |
| Components | GET `/components/:id` | Y | Y | Y |
| Components | POST `/components` | Y | N | N |
| Components | PUT `/components/:id` | Y | N | N |
| Components | DELETE `/components/:id` | Y | N | N |
| Components | POST `/components/add-stock` | Y | N | N |
| Services | GET `/services` | Y | Y | Y |
| Services | GET `/services/:id` | Y | Y | Y |
| Services | POST `/services` | Y | N | N |
| Services | PUT `/services/:id` | Y | N | N |
| Services | DELETE `/services/:id` | Y | N | N |
| Devices | GET `/devices` | Y | Y | Y |
| Devices | GET `/devices/:id` | Y | Y | Y |
| Devices | POST `/devices` | Y | Y | Y |
| Devices | PUT `/devices/:id` | Y | Y | N |
| Devices | DELETE `/devices/:id` | Y | N | N |
| Repair Tickets | GET `/repair-tickets` | Y | Y | Y |
| Repair Tickets | GET `/repair-tickets/:id` | Y | Y | Y |
| Repair Tickets | POST `/repair-tickets` | Y | Y | Y |
| Repair Tickets | PUT `/repair-tickets/:id` | Y | Y | N |
| Repair Tickets | PATCH `/repair-tickets/:id/status` | Y | Y | N |
| Repair Tickets | PATCH `/repair-tickets/:id/cancel` | Y | Y | N |
| Repair Tickets | DELETE `/repair-tickets/:id` | Y | N | N |
| Warranty | GET `/warranty` | Y | Y | Y |
| Warranty | GET `/warranty/search` | Y | Y | Y |
| Warranty | GET `/warranty/:id` | Y | Y | Y |
| Warranty | POST `/warranty` | Y | Y | N |
| Warranty | PUT `/warranty/:id` | Y | Y | N |
| Warranty | DELETE `/warranty/:id` | Y | N | N |
| Media | GET `/media` | Y | Y | N |
| Media | POST `/media/upload` | Y | Y | N |
| Media | GET `/media/ticket/:ticketId` | Y | Y | Y |
| Media | GET `/media/:id` | Y | Y | Y |
| Media | DELETE `/media/:id` | Y | Y | N |
| Profiles | GET `/profiles/me` | Y | Y | Y |
| Profiles | GET `/profiles/:userId` | Y | Y | Y |
| Profiles | PUT `/profiles/me` | Y | Y | Y |
| Profiles | POST `/profiles/upload-image` | Y | Y | Y |
| Upload | POST `/upload/one_image` | Y | Y | Y |
| Upload | GET `/upload/:filename` | Y | Y | Y |
| Dashboard | GET `/dashboard/stats` | Y | Y | Y |

## 3. Ket qua test da chay trong ngay
- ADMIN: da test full luong nghiep vu, da pass toan bo (upload fail 1 lan do gui `.txt`, test lai `.jpg` pass).
- MODERATOR: 27/27 test pass (cac API admin-only tra 403 dung ky vong).
- USER: test thanh cong cac API user duoc phep, cac API quan tri tra 403 dung ky vong.

## 4. Cac diem da fix lien quan role/API
- Bo sung `GET /components/:id`.
- Bo sung `PATCH /repair-tickets/:id/cancel` + logic hoan kho linh kien khi huy.
- Bo sung `GET /media` cho ADMIN/MODERATOR.
- Sua auth/profile de role USER goi `profiles/me` on dinh.
- Cau hinh lai Mailtrap + sua gui mail reset password.

## 5. Ghi chu
- Neu test bang PowerShell, nen gui body JSON qua file (`--data-binary @file.json`) de tranh loi parse JSON.
- Upload anh phai dung dung dinh dang hop le (vd `.jpg`, `image/jpeg`).

---
Tai lieu tong hop duoc tao ngay 2026-03-29.
