# 100 Kịch Bản Kiểm Thử (Test Cases) Cho Giao Diện Frontend

Tài liệu này cung cấp 100 test case chi tiết cho giao diện người dùng (Frontend) của hệ thống Quản lý Cửa hàng Sửa chữa Điện thoại. Các test case này tập trung vào kiểm thử giao diện và luồng xử lý phía client (sử dụng dữ liệu giả lập/mock data).

---

## I. Quản lý Đăng nhập & Phân quyền (15 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 1 | TC01 | Đăng nhập thành công với quyền ADMIN | User: `admin@test.com`, Pass: `123456` | Chuyển hướng đến Dashboard, hiển thị đầy đủ menu Admin. |
| 2 | TC02 | Đăng nhập thành công với quyền Kỹ thuật viên | User: `tech@test.com`, Pass: `123456` | Chuyển hướng đến Dashboard, ẩn menu Quản lý người dùng. |
| 3 | TC03 | Đăng nhập thành công với quyền Khách hàng | User: `cus@test.com`, Pass: `123456` | Chuyển hướng đến trang tra cứu, chỉ xem được dữ liệu cá nhân. |
| 4 | TC04 | Đăng nhập thất bại do sai mật khẩu | User: `admin@test.com`, Pass: `wrong` | Hiển thị thông báo "Mật khẩu không chính xác". |
| 5 | TC05 | Đăng nhập thất bại do email không tồn tại | User: `no@test.com`, Pass: `123456` | Hiển thị thông báo "Tài khoản không tồn tại". |
| 6 | TC06 | Kiểm tra validate email không đúng định dạng | User: `admin@`, Pass: `123456` | Hiển thị lỗi "Email không hợp lệ" ngay dưới ô input. |
| 7 | TC07 | Kiểm tra mật khẩu trống | User: `admin@test.com`, Pass: `[Để trống]` | Hiển thị lỗi "Vui lòng nhập mật khẩu". |
| 8 | TC08 | Đăng ký tài khoản mới thành công | User: `new@test.com`, Pass: `123456`, Name: `Hieu` | Hiển thị thông báo "Đăng ký thành công", chuyển đến Đăng nhập. |
| 9 | TC09 | Đăng ký thất bại do trùng email | User: `admin@test.com` (đã có) | Hiển thị thông báo "Email đã được sử dụng". |
| 10 | TC10 | Đăng xuất tài khoản | Bấm nút Đăng xuất | Xóa token trong localStorage/cookie, chuyển về trang Đăng nhập. |
| 11 | TC11 | Truy cập trang Admin khi chưa đăng nhập | Gõ trực tiếp URL `/admin/users` | Bị chặn và chuyển hướng về trang Đăng nhập. |
| 12 | TC12 | Truy cập trang Admin bằng tài khoản Customer | Đăng nhập Cus, gõ URL `/admin/users` | Hiển thị trang 403 Forbidden hoặc thông báo "Không có quyền". |
| 13 | TC13 | Ghi nhớ đăng nhập (Remember me) | Tích chọn "Ghi nhớ" | Sau khi tắt trình duyệt và mở lại, vẫn giữ trạng thái đăng nhập. |
| 14 | TC14 | Quên mật khẩu - Gửi mail thành công | Email: `admin@test.com` | Hiển thị "Đã gửi link reset mật khẩu vào email của bạn". |
| 15 | TC15 | Reset mật khẩu mới | Pass mới: `654321` | Hiển thị "Đổi mật khẩu thành công", dùng pass mới đăng nhập được. |

---

## II. Bảng điều khiển - Dashboard (15 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 16 | TC16 | Hiển thị tổng số phiếu sửa chữa | Tổng: `150` | Số hiển thị trên card là "150". |
| 17 | TC17 | Hiển thị tổng số thiết bị | Tổng: `80` | Số hiển thị trên card là "80". |
| 18 | TC18 | Hiển thị tổng số người dùng | Tổng: `45` | Số hiển thị trên card là "45". |
| 19 | TC19 | Hiển thị tổng doanh thu (Admin) | Tổng: `50.000.000đ` | Số hiển thị trên card là "50.000.000đ". |
| 20 | TC20 | Ẩn thẻ doanh thu đối với Customer | Quyền: Customer | Không nhìn thấy thẻ Doanh thu trên màn hình. |
| 21 | TC21 | Hiển thị biểu đồ trạng thái phiếu | Dữ liệu: `[Chờ: 10, Đang sửa: 5]` | Biểu đồ cột hiển thị đúng tỷ lệ. |
| 22 | TC22 | Hiển thị biểu đồ xu hướng doanh thu | Dữ liệu 7 ngày gần nhất | Biểu đồ đường hiển thị đúng các điểm dữ liệu. |
| 23 | TC23 | Kiểm tra tooltip trên biểu đồ | Rê chuột vào 1 cột trên biểu đồ | Hiển thị popup thông tin chi tiết của cột đó. |
| 24 | TC24 | Hiển thị danh sách phiếu gần đây | Mảng 5 phiếu mới nhất | Bảng hiển thị đúng 5 dòng dữ liệu mới nhất. |
| 25 | TC25 | Kiểm tra link từ bảng "Phiếu gần đây" | Bấm vào mã phiếu `TK001` | Chuyển hướng đến trang chi tiết phiếu `TK001`. |
| 26 | TC26 | Hiển thị trạng thái rỗng khi không có phiếu | Danh sách phiếu: `[]` | Hiển thị icon rỗng hoặc chữ "Không có dữ liệu". |
| 27 | TC27 | Nút "Làm mới" dữ liệu | Bấm nút Refresh | Hiển thị loading nhẹ và cập nhật lại số liệu mới. |
| 28 | TC28 | Hiển thị đúng nhãn theo quyền (Admin) | Quyền: Admin | Thẻ hiển thị "Tổng số phiếu". |
| 29 | TC29 | Hiển thị đúng nhãn theo quyền (Cus) | Quyền: Customer | Thẻ hiển thị "Phiếu của tôi". |
| 30 | TC30 | Kiểm tra co giãn biểu đồ khi resize | Thu nhỏ cửa sổ trình duyệt | Biểu đồ tự động co giãn theo khung (Responsive). |

---

## III. Quản lý Phiếu sửa chữa (25 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 31 | TC31 | Hiển thị danh sách phiếu sửa chữa | Mảng `[TK001, TK002]` | Bảng hiển thị đầy đủ các cột và dòng dữ liệu. |
| 32 | TC32 | Tìm kiếm phiếu theo mã phiếu | Gõ `TK001` | Bảng chỉ còn lại dòng có mã `TK001`. |
| 33 | TC33 | Tìm kiếm phiếu theo tên thiết bị | Gõ `iPhone 13` | Lọc ra các phiếu sửa iPhone 13. |
| 34 | TC34 | Lọc phiếu theo trạng thái (Chờ xử lý) | Chọn status: `pending` | Bảng chỉ hiển thị các phiếu đang chờ. |
| 35 | TC35 | Mở form tạo phiếu mới | Bấm nút "Tạo phiếu" | Mở ra modal hoặc trang tạo phiếu rỗng. |
| 36 | TC36 | Tạo phiếu thành công | Khách: `A`, Máy: `iPhone 13`, Lỗi: `Hỏng pin` | Hiển thị "Tạo phiếu thành công", phiếu mới xuất hiện trong bảng. |
| 37 | TC37 | Tạo phiếu thất bại do thiếu thông tin | Không chọn máy | Báo lỗi "Vui lòng chọn thiết bị" tại trường đó. |
| 38 | TC38 | Xem chi tiết 1 phiếu | Bấm xem `TK001` | Hiển thị đầy đủ thông tin: Khách hàng, máy, dịch vụ, giá tiền. |
| 39 | TC39 | Cập nhật trạng thái phiếu sang "Đang sửa" | Chọn status: `fixing` | Trạng thái đổi màu (xanh dương) và hiển thị "Đang sửa chữa". |
| 40 | TC40 | Cập nhật trạng thái phiếu sang "Hoàn thành" | Chọn status: `completed` | Trạng thái đổi màu xanh lá, tự động tính tổng tiền. |
| 41 | TC41 | Hủy phiếu sửa chữa | Chọn status: `canceled` | Trạng thái đổi màu đỏ "Đã hủy", vô hiệu hóa các nút chỉnh sửa. |
| 42 | TC42 | Thêm dịch vụ vào phiếu | Chọn dịch vụ: `Thay pin` | Tổng tiền tăng thêm giá của dịch vụ `Thay pin`. |
| 43 | TC43 | Xóa dịch vụ khỏi phiếu | Bấm xóa `Thay pin` | Tổng tiền giảm đi tương ứng. |
| 44 | TC44 | Thêm linh kiện vào phiếu | Chọn linh kiện: `Pin iPhone 13` | Cộng thêm tiền linh kiện vào tổng chi phí. |
| 45 | TC45 | Kiểm tra tính tổng tiền tự động | Dịch vụ: `200k`, Linh kiện: `300k` | Tổng tiền hiển thị chính xác là `500.000đ`. |
| 46 | TC46 | In phiếu sửa chữa | Bấm nút "In phiếu" | Mở ra cửa sổ preview in của trình duyệt. |
| 47 | TC47 | Phân trang danh sách phiếu | Bấm trang `2` | Bảng chuyển sang hiển thị dữ liệu trang 2. |
| 48 | TC48 | Thay đổi số dòng hiển thị trên trang | Chọn hiển thị `20` dòng/trang | Bảng load lại và hiển thị tối đa 20 dòng. |
| 49 | TC49 | Sắp xếp phiếu theo ngày tạo | Bấm vào header cột "Ngày tạo" | Danh sách đảo ngược thứ tự thời gian. |
| 50 | TC50 | Thông báo lỗi khi load danh sách phiếu thất bại | API lỗi 500 | Hiển thị toast message "Lỗi khi tải danh sách phiếu". |
| 51 | TC51 | Kiểm tra quyền sửa phiếu của Kỹ thuật viên | Tech mở phiếu | Được sửa trạng thái, không được sửa giá tiền. |
| 52 | TC52 | Kiểm tra quyền xem phiếu của Khách hàng | Khách mở phiếu | Chỉ xem được thông tin, không có các nút bấm thao tác. |
| 53 | TC53 | Nhập ghi chú cho phiếu | Gõ "Máy bị rơi nước" | Lưu lại ghi chú thành công. |
| 54 | TC54 | Upload ảnh tình trạng máy | Chọn file `dienthoai.jpg` | Hiển thị thumbnail ảnh đã chọn trong form. |
| 55 | TC55 | Xóa ảnh đã upload | Bấm nút xóa trên thumbnail | Ảnh biến mất khỏi form. |

---

## IV. Quản lý Thiết bị (15 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 56 | TC56 | Hiển thị danh sách thiết bị | Mảng `[Device1, Device2]` | Bảng hiển thị đầy đủ thông tin thiết bị. |
| 57 | TC57 | Tìm kiếm thiết bị theo Số sê-ri / IMEI | Gõ `888888` | Lọc ra thiết bị có sê-ri chứa `888888`. |
| 58 | TC58 | Tìm kiếm thiết bị theo Model | Gõ `Samsung S22` | Lọc ra các máy Samsung S22. |
| 59 | TC59 | Mở modal thêm thiết bị | Bấm "Thêm thiết bị" | Modal mở ra với các trường rỗng. |
| 60 | TC60 | Thêm thiết bị thành công | Model: `iPhone 14`, Sê-ri: `123`, Hãng: `Apple` | Hiển thị "Thêm thành công", máy mới vào bảng. |
| 61 | TC61 | Thêm thiết bị thất bại do trùng Số sê-ri | Sê-ri: `123` (đã có) | Backend báo lỗi, frontend hiển thị toast cảnh báo. |
| 62 | TC62 | Mở modal sửa thiết bị | Bấm Sửa máy `iPhone 14` | Modal mở ra với dữ liệu cũ điền sẵn. |
| 63 | TC63 | Sửa thiết bị thành công | Đổi Model thành `iPhone 14 Pro` | Dữ liệu trong bảng cập nhật ngay lập tức. |
| 64 | TC64 | Xác nhận xóa thiết bị | Bấm Xóa máy `iPhone 14` | Hiện Modal.confirm hỏi "Bạn có chắc chắn muốn xóa?". |
| 65 | TC65 | Đồng ý xóa thiết bị | Bấm "Xóa" trên Modal confirm | Gọi API xóa, máy biến mất khỏi bảng. |
| 66 | TC66 | Hủy thao tác xóa thiết bị | Bấm "Hủy" trên Modal confirm | Đóng modal, máy vẫn giữ nguyên trong bảng. |
| 67 | TC67 | Kiểm tra validate độ dài Số sê-ri | Nhập chuỗi 20 ký tự | Hiển thị cảnh báo nếu vượt quá giới hạn (nếu có quy định). |
| 68 | TC68 | Chọn hãng từ danh sách gợi ý | Gõ `A` -> Hiện `Apple` | Chọn được `Apple` nhanh chóng. |
| 69 | TC69 | Hiển thị lable "Không có" khi thiếu Model | Máy không có tên model | Bảng hiển thị chữ "Không có" (render fallback). |
| 70 | TC70 | Click vào Số sê-ri để copy | Bấm vào mã sê-ri | Copy mã vào clipboard và hiện toast "Đã copy". |

---

## V. Quản lý Dịch vụ & Linh kiện (15 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 71 | TC71 | Xem danh sách dịch vụ | Tab: `Dịch vụ` | Bảng hiển thị: Tên dịch vụ, Giá cơ bản, Thời gian. |
| 72 | TC72 | Xem danh sách linh kiện | Tab: `Linh kiện` | Bảng hiển thị: Tên linh kiện, SKU, Số lượng, Giá. |
| 73 | TC73 | Chuyển đổi qua lại giữa 2 tab | Bấm tab `Linh kiện` | Bảng đổi sang dữ liệu linh kiện mượt mà. |
| 74 | TC74 | Tìm kiếm dịch vụ | Gõ `Ép kính` | Lọc ra các dịch vụ ép kính. |
| 75 | TC75 | Thêm dịch vụ mới thành công | Tên: `Vệ sinh`, Giá: `50.000` | Thêm thành công vào bảng. |
| 76 | TC76 | Thêm linh kiện mới thành công | Tên: `Màn hình`, SKU: `MH01`, Kho: `10` | Thêm thành công vào bảng. |
| 77 | TC77 | Validate giá tiền âm | Nhập giá: `-50000` | Báo lỗi "Giá không thể nhỏ hơn 0". |
| 78 | TC78 | Sửa giá dịch vụ | Đổi giá từ `100k` thành `120k` | Giá mới hiển thị trên bảng. |
| 79 | TC79 | Xóa dịch vụ | Bấm xóa dịch vụ `Vệ sinh` | Hiện modal confirm, đồng ý sẽ xóa mất dòng đó. |
| 80 | TC80 | Cảnh báo linh kiện sắp hết (Màu đỏ) | Số lượng: `3` | Tag hiển thị màu đỏ (volcano) kèm chữ "Sắp hết". |
| 81 | TC81 | Linh kiện còn nhiều (Màu xanh) | Số lượng: `20` | Tag hiển thị màu xanh lá (green). |
| 82 | TC82 | Validate mã SKU trùng | Nhập SKU: `MH01` (đã có) | Báo lỗi "Mã SKU này đã tồn tại". |
| 83 | TC83 | Nhập số lượng tồn bằng phím | Gõ `15` vào ô InputNumber | Nhận đúng giá trị số `15`. |
| 84 | TC84 | Tăng số lượng tồn bằng nút bấm | Bấm nút `+` trên InputNumber | Số lượng tăng lên `16`. |
| 85 | TC85 | Giảm số lượng tồn bằng nút bấm | Bấm nút `-` trên InputNumber | Số lượng giảm đi 1 đơn vị. |

---

## VI. Tra cứu Bảo hành (10 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 86 | TC86 | Tra cứu bảo hành thành công | Nhập Sê-ri: `123` (Có bảo hành) | Hiện khung thông tin: Máy, Hạn bảo hành, Trạng thái. |
| 87 | TC87 | Tra cứu bảo hành thất bại (Không có máy) | Nhập Sê-ri: `999` (Không có) | Hiện toast lỗi "Không tìm thấy thiết bị". |
| 88 | TC88 | Thiết bị hết hạn bảo hành | Ngày hết hạn: `10/10/2023` | Tag hiển thị màu đỏ "Đã hết hạn". |
| 89 | TC89 | Thiết bị còn hạn bảo hành | Ngày hết hạn: `10/10/2027` | Tag hiển thị màu xanh "Còn bảo hành". |
| 90 | TC90 | Bấm tra cứu khi chưa nhập Số sê-ri | Để trống và bấm "Tra cứu" | Hiện cảnh báo "Vui lòng nhập Số sê-ri / IMEI". |
| 91 | TC91 | Xóa nhanh số sê-ri đã nhập | Bấm vào icon `x` trong ô Input | Ô input trở về trạng thái rỗng. |
| 92 | TC92 | Định dạng ngày tháng hiển thị | Data: `2026-05-10` | Hiển thị trên giao diện là `10/05/2026`. |
| 93 | TC93 | Hiển thị số ngày còn lại (nếu có) | Tính toán ngày hiện tại | Có thể hiển thị thêm "Còn 30 ngày". |
| 94 | TC94 | Kiểm tra bấm Enter để tra cứu | Gõ mã và bấm phím Enter | Tự động kích hoạt hành động tra cứu. |
| 95 | TC95 | Hiển thị skeleton khi đang load | Đang gọi API | Hiện khung xám nhấp nháy thay vì trang trắng. |

---

## VII. Kiểm thử Giao diện & UX chung (5 Cases)

| STT | Mã TC | Tên Kịch Bản | Dữ liệu mẫu (Mock Data) | Kết quả mong đợi |
|-----|-------|--------------|-------------------------|------------------|
| 96 | TC96 | Kiểm tra giao diện Mobile | Kích thước màn hình `< 768px` | Menu sidebar thu gọn, bảng hiển thị dạng scroll ngang. |
| 97 | TC97 | Kiểm tra giao diện Dark Mode (Nếu có) | Bật chế độ tối | Toàn bộ background chuyển màu tối, text chuyển màu sáng. |
| 98 | TC98 | Bấm nút Back trên trình duyệt | Đang ở trang Detail -> Quay lại | Trình duyệt quay lại trang List và giữ nguyên bộ lọc cũ. |
| 99 | TC99 | Tự động focus vào ô input đầu tiên | Mở modal tạo mới | Con trỏ chuột tự động nhấp nháy ở ô nhập tên đầu tiên. |
| 100| TC100| Thông báo mất kết nối mạng | Rút dây mạng / Tắt wifi | Hiển thị thông báo "Mất kết nối mạng, vui lòng kiểm tra lại". |

---
*Tài liệu này được tạo tự động để phục vụ cho việc kiểm thử giao diện hệ thống.*
