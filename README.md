# 🏛️ Hệ Thống Dịch Vụ Công Trực Tuyến Cấp Phường/Xã (Tích Hợp Trợ Lý AI)

Hệ thống hỗ trợ đăng ký, tiếp nhận và theo dõi hồ sơ thủ tục hành chính trực tuyến tại cấp phường/xã, tích hợp trợ lý ảo AI (Google Gemini 2.0 Flash Lite) hỗ trợ tư vấn và tra cứu thông minh.

---

## 🌟 1. Danh Sách Các Chức Năng Đã Hoàn Thiện

Hệ thống được xây dựng hoàn chỉnh với **3 phân quyền người dùng (Citizen, Staff, Admin)** và **10 module nghiệp vụ cốt lõi**:

### 👤 A. Phân Hệ Người Dân (Citizen Portal)

- 🔐 **Xác thực & Tài khoản**: Đăng ký tài khoản kèm **xác thực mã OTP gửi về Gmail (6 chữ số)**, đăng nhập JWT, cập nhật hồ sơ cá nhân, đổi mật khẩu.
- 📋 **Tra cứu thủ tục công**: Tìm kiếm, lọc theo lĩnh vực, xem chi tiết thủ tục (thành phần hồ sơ thẻ trực quan, quy trình, biểu mẫu, thời hạn & phí).
- 📝 **Nộp hồ sơ trực tuyến**: Điền biểu mẫu, tải đính kèm tài liệu (PDF, Word, Ảnh), lưu bản nháp (`DRAFT`) hoặc nộp chính thức (`SUBMITTED`).
- 💳 **Thanh toán Lệ phí trực tuyến (VietQR)**: Quét mã QR ngân hàng động chuẩn Napas 24/7 theo mã hồ sơ, xem và tải **Biên lai thu lệ phí điện tử** có mộc đỏ chứng thực.
- 🔎 **Theo dõi tiến độ hồ sơ**: Danh sách hồ sơ cá nhân có phân trang linh hoạt, xem tiến trình trực quan thời gian thực (Interactive Timeline/Steps), bổ sung tài liệu khi cán bộ yêu cầu (`NEED_REVISION` ➔ `RESUBMITTED`).
- 🌐 **Tra cứu công khai không cần đăng nhập**: Tra cứu tình trạng hồ sơ & quét mã QR thanh toán qua Mã hồ sơ (`HS{yyyy}{sequence}`) tại `/tracking`.
- 📊 **Citizen Dashboard**: Tổng quan trạng thái các hồ sơ đã nộp và thao tác nhanh.
- ❓ **Cổng Hỏi & Đáp (FAQ)**: Tra cứu bộ câu hỏi thường gặp theo chủ đề.

### 👔 B. Phân Hệ Cán Bộ (Staff Portal)

- 📊 **Staff Dashboard**: Thống kê khối lượng công việc, hồ sơ chờ tiếp nhận, đang xử lý, quá hạn.
- 🗂️ **Quản lý & Xử lý hồ sơ**:
  - Xem danh sách hồ sơ có phân trang chuyên nghiệp, lọc theo trạng thái và tìm kiếm nhanh.
  - **Tiếp nhận hồ sơ** (`SUBMITTED` / `RESUBMITTED` ➔ `RECEIVED` / `PROCESSING`).
  - **Yêu cầu bổ sung hồ sơ** (`PROCESSING` ➔ `NEED_REVISION`) kèm lý do cụ thể.
  - **Từ chối hồ sơ** (`PROCESSING` ➔ `REJECTED`) kèm lý do và căn cứ pháp lý.
  - **Phê duyệt & Hoàn tất** (`PROCESSING` ➔ `COMPLETED`) kèm đối chiếu lệ phí / biên lai và đính kèm file kết quả bản điện tử.
- 📜 **Nhật ký xử lý (Audit History)**: Tự động ghi lại từng bước thao tác (ai đổi trạng thái, lúc nào, lý do gì) đảm bảo tính minh bạch.

### 🛠️ C. Phân Hệ Quản Trị Viên (Admin Portal)

- 📈 **Admin Dashboard**: Thống kê tổng thể toàn hệ thống (Tổng người dùng, tổng thủ tục, tổng hồ sơ, biểu đồ tỷ lệ trạng thái, xu hướng nộp hồ sơ theo tháng, thời gian xử lý trung bình).
- 👥 **Quản lý Người dùng**: Danh sách tài khoản có phân trang, bật/tắt kích hoạt tài khoản nhanh, tạo mới tài khoản Cán bộ / Admin.
- 📁 **Quản lý Danh mục Lĩnh vực**: Thêm, sửa, xóa các nhóm lĩnh vực hành chính (Tư pháp, Đất đai, Xây dựng, Hộ tịch...), gắn icon trực quan và bật/tắt hiển thị.
- 📄 **Quản lý Thủ tục Hành chính**: CRUD thủ tục hành chính, cấu hình thành phần hồ sơ bắt buộc/tùy chọn, thiết lập lệ phí & thời hạn giải quyết.
- 💡 **Quản lý Bộ câu hỏi FAQ**: CRUD các câu hỏi thường gặp và câu trả lời chuẩn phục vụ người dân và đào tạo Chatbot AI.
- 🤖 **Cấu hình Trợ lý AI (Chatbot Persona)**: Admin tùy chỉnh phong cách xưng hô của AI (*Bạn - Tôi, Người dùng - Chúng tôi, Công dân - Ban tiếp nhận...*), xem trước giao diện chat trực tiếp (Live Preview).

### 🤖 D. Trợ Lý Ảo AI (Google Gemini 2.0 Flash Lite)

- 💬 **Hỗ trợ 24/7**: Tích hợp cửa sổ chat nổi (Widget) trên toàn bộ hệ thống.
- 🧠 **Ngữ cảnh thông minh**: Tự động tích hợp thông tin danh mục thủ tục, bộ FAQ và dữ liệu hồ sơ cá nhân của người dùng đang đăng nhập.
- ⚡ **Chống nghẽn & Fallback tức thì**: Tích hợp cơ chế timeout và động cơ phản hồi nội bộ dự phòng khi mất kết nối mạng.
- 🔒 **Bảo mật tuyệt đối**: Gọi API qua Backend Spring Boot, không để lộ API Key ra Frontend, tuân thủ nguyên tắc bảo vệ quyền riêng tư.

### 🔔 E. Hệ Thống Thông Báo Thời Gian Thực (In-app Notification)

- Tự động sinh thông báo khi hồ sơ thay đổi trạng thái.
- Huy hiệu (Badge) đếm số lượng chưa đọc trên Header, trang trung tâm thông báo có bộ lọc tab và phân trang trực quan.

---

## 🔑 2. Tài Khoản Thử Nghiệm Hệ Thống (Demo Accounts)

Hệ thống đã tạo sẵn dữ liệu mẫu (Seed Data) cho cả 3 vai trò:

| Vai trò | Tên đăng nhập / Email | Mật khẩu mặc định | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@dichvucong.gov.vn` (hoặc `admin`) | `Admin@123` | Toàn quyền quản trị hệ thống |
| **Cán bộ xử lý (Staff)** | `staff_001` (hoặc `canbo@dichvucong.gov.vn`) | `Staff@123` | Xử lý và phê duyệt hồ sơ |
| **Người dân (Citizen)** | `nguyenvana@gmail.com` (hoặc `nguyenvana`) | `User@123` | Nộp và theo dõi hồ sơ |

---

## 📁 3. Cấu Trúc Dự Án

```text
HeThongDichVuCong/
├── .vscode/               # Cấu hình workspace VS Code (tasks, debug)
├── docker-compose.yml     # Khởi tạo nhanh PostgreSQL database
├── README.md              # Tài liệu tổng quan dự án
│
├── backend/               # Backend Spring Boot (Java 17+, Maven)
│   ├── src/main/java/com/citizenportal/backend/
│   │   ├── auth/          # Đăng ký, đăng nhập, JWT, xác thực
│   │   ├── user/          # Quản lý người dùng và hồ sơ cá nhân
│   │   ├── procedure/     # Danh mục lĩnh vực và thủ tục hành chính
│   │   ├── application/   # Quản lý vòng đời hồ sơ, state machine, upload file
│   │   ├── notification/  # Hệ thống thông báo in-app
│   │   ├── dashboard/     # Thống kê số liệu cho Citizen, Staff, Admin
│   │   ├── chatbot/       # Tích hợp Gemini AI, Fallback engine, Persona settings
│   │   ├── faq/           # Bộ câu hỏi thường gặp FAQ
│   │   ├── common/        # Exception handler, DTO chuẩn, ApiResponse
│   │   └── config/        # SecurityConfig, CorsConfig, GeminiConfig, DataInitializer
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/              # Frontend Angular 19 + NG-ZORRO (Ant Design)
│   ├── src/app/
│   │   ├── core/          # Auth, JWT Interceptor, Error Interceptor, Guards, Services
│   │   ├── shared/        # Components dùng chung (header, footer, status tag, loading)
│   │   ├── layouts/       # MainLayout (Citizen), StaffLayout, AdminLayout
│   │   ├── features/      # Auth, Citizen, Staff, Admin, Procedures, Applications, Chatbot, FAQ, Tracking, Dashboard
│   │   └── app.routes.ts  # Cấu hình phân tuyến theo quyền
│   ├── package.json
│   └── angular.json
│
└── docs/                  # Tài liệu phân tích thiết kế & báo cáo
    ├── api/               # Tài liệu chi tiết RESTful API & chuẩn hóa Response
    ├── database/          # Sơ đồ CSDL (ERD), Script bảng, Setup DB
    └── architecture/      # Kiến trúc hệ thống, State Machine, Security
```

---

## 🛠️ 4. Yêu Cầu Môi Trường (Prerequisites)

- **Java JDK**: Version 17 hoặc 21+
- **Node.js**: Version 20.x trở lên
- **Angular CLI**: Version 19+ (`npm install -g @angular/cli`)
- **Database**: PostgreSQL 15+ (hoặc Docker Desktop)

---

## 🚀 5. Hướng Dẫn Khởi Chạy Toàn Bộ Hệ Thống

### BƯỚC 1: Khởi Chạy Database (PostgreSQL)

- **Dùng Docker**:

  ```bash
  docker compose up -d
  ```

  *(Database `dichvucong_db` chạy tại `localhost:5432`, user: `postgres`, pass: `postgres`)*.

---

### BƯỚC 2: Khởi Chạy Backend (Spring Boot)

Mở terminal tại thư mục `backend`:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

> ✅ **Backend API chạy tại:** `http://localhost:8080/api`  
> *(DataInitializer sẽ tự động tạo bảng và nạp sẵn dữ liệu mẫu)*.

---

### BƯỚC 3: Khởi Chạy Frontend (Angular)

Mở terminal tại thư mục `frontend`:

```bash
cd frontend
npm install
npm start
```

> ✅ **Frontend Web chạy tại:** `http://localhost:4200`

---

## 🌐 6. Kiến Trúc RESTful API Chuẩn Hóa

Toàn bộ trao đổi dữ liệu giữa Frontend và Backend đều thông qua chuẩn **RESTful API**:

- **Định dạng dữ liệu**: `JSON`
- **Chuẩn hóa phản hồi thành công**:

  ```json
  { "success": true, "data": { ... }, "message": "Thao tác thành công" }
  ```

- **Chuẩn hóa phản hồi lỗi**:

  ```json
  { "success": false, "code": "INVALID_STATE_TRANSITION", "message": "...", "timestamp": "..." }
  ```

- **Bảo mật**: JWT Bearer Token, kiểm tra quyền 2 lớp (Role-based `@PreAuthorize` + Ownership Validation ở Service Layer để chống IDOR).
