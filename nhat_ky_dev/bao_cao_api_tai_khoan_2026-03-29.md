# Bao Cao API Tai Khoan - Ngay 2026-03-29

## 1. Pham vi da lam
- Hoan thien nhom API tai khoan (`/api/v1/auth/*`) va profile lien quan (`/api/v1/profiles/*`).
- Sua loi dang ky, quen mat khau, doi mat khau, profile me.
- Cau hinh SMTP Mailtrap va xac nhan gui mail thanh cong.

## 2. Danh sach API tai khoan hien co
Base URL: `http://localhost:5001/api/v1`

### Auth
- `POST /auth/login` - Dang nhap, tra JWT token
- `POST /auth/register` - Dang ky tai khoan moi
- `GET /auth/me` - Lay thong tin user hien tai (can token)
- `POST /auth/changepassword` - Doi mat khau (can token)
- `POST /auth/forgotpassword` - Gui mail reset password
- `POST /auth/resetpassword/:token` - Dat lai mat khau theo token
- `POST /auth/logout` - Dang xuat

### Profile
- `GET /profiles/me` - Lay profile cua user dang dang nhap
- `GET /profiles/:userId` - Lay profile theo user id
- `PUT /profiles/me` - Cap nhat profile
- `POST /profiles/upload-image` - Upload avatar

## 3. Cac thay doi da sua trong ngay

### 3.1 routes/auth.js
- Bo sung API con thieu: `changepassword`, `forgotpassword`, `resetpassword/:token`.
- Sua `register`:
  - Co transaction khi MongoDB ho tro.
  - Co fallback khi MongoDB standalone (tranh loi transaction).
  - Tao `phone` tam unique cho profile de tranh trung `N/A`.

### 3.2 schemas/users.js
- Khoi phuc hook hash password:
  - `pre("save")`
  - `pre("findOneAndUpdate")`
- Co guard tranh hash lai chuoi da hash.

### 3.3 controllers/profiles.js
- Dong bo dung field schema: `user_id` (khong dung `user`).
- Tu dong tao profile mac dinh hop le khi user chua co profile.
- Sua update profile/image de khong vi pham validation.

### 3.4 utils/sendMail.js
- Dung `MAIL_FROM` tu `.env`.
- Sua html mail reset password dung cu phap.

### 3.5 .env
- Xoa doan code nodemailer bi dan nham vao `.env`.
- Cau hinh Mailtrap SMTP.
- `APP_URL` chuan ve `http://localhost:5001`.

## 4. Loi da gap va cach xu ly
- Loi `Expected property name or '}' in JSON...`:
  - Nguyen nhan: JSON body gui tu PowerShell/curl bi escape sai.
  - Cach xu ly: gui bang `--data-binary @file.json`.
- Loi `profiles/me` 500 (validation profile):
  - Nguyen nhan: sai field `user` vs `user_id`, thieu required fields.
  - Cach xu ly: sua controller profile va tu tao profile mac dinh hop le.
- Loi register trung profile phone:
  - Nguyen nhan: `phone` unique, gia tri mac dinh bi trung.
  - Cach xu ly: tao phone tam unique theo timestamp.
- Loi forgotpassword 500 do SMTP:
  - Nguyen nhan: `.env` chua dung/thieu thong tin Mailtrap.
  - Cach xu ly: cap nhat SMTP va test lai thanh cong.

## 5. Ket qua test trong ngay (tom tat)
- `POST /auth/login`: 200
- `GET /auth/me`: 200
- `POST /auth/changepassword`: 200 (case old password dung), 400 (case sai old password)
- `POST /auth/forgotpassword`: 200 sau khi cau hinh Mailtrap
- `GET /profiles/me`: 200 sau khi sua controller profile
- `POST /auth/logout`: 200

## 6. Ghi chu van hanh
- Neu test bang PowerShell, uu tien tao file JSON tam va gui qua `--data-binary @file`.
- Neu MongoDB khong chay replica set, register van chay nho fallback non-transaction.
- Can giu bi mat `MAIL_USER`, `MAIL_PASS` trong moi truong that (khong commit len git public).

## 7. File da chinh trong ngay (tai khoan)
- `backend/routes/auth.js`
- `backend/schemas/users.js`
- `backend/controllers/profiles.js`
- `backend/utils/sendMail.js`
- `backend/.env`

---
Bao cao duoc tao tu dong ngay 2026-03-29.
