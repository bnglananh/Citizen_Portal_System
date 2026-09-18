# 🅰️ Hướng Dẫn Phát Triển & Build Frontend (Angular)

Tài liệu hướng dẫn cài đặt, chạy thử (Development), cấu trúc module và đóng gói (Production Build) cho mã nguồn Frontend của Hệ thống Dịch vụ công.

---

## 🛠️ 1. Yêu Cầu Môi Trường (Prerequisites)

- **Node.js**: Version 20.x trở lên
- **NPM**: Đi kèm với Node.js
- **Angular CLI**: Version 19+ (`npm install -g @angular/cli`)
- **UI Library**: NG-ZORRO (Ant Design for Angular)

---

## 📁 2. Cấu Trúc Mã Nguồn Frontend

```text
frontend/src/app/
├── core/                  # Dịch vụ cốt lõi: Auth, JWT Interceptor, Error Handler, PaymentService, Guards
├── shared/                # Component dùng chung: StatusTag, DocumentViewer, Timeline, QrPayment, FileUploader
├── layouts/               # Layout chia theo phân hệ:
│   ├── main-layout/       # Layout dành cho Người dân & Khách vãng lai
│   ├── staff-layout/      # Layout dành cho Cán bộ
│   └── admin-layout/      # Layout dành cho Quản trị viên (Search box, User dropdown)
├── features/              # Các trang chức năng:
│   ├── auth/              # Đăng nhập, Đăng ký (Quy trình 2 bước xác thực OTP Gmail), Đổi mật khẩu
│   ├── citizen/           # Dashboard cá nhân, Nộp hồ sơ, Chi tiết hồ sơ, Thanh toán VietQR
│   ├── staff/             # Dashboard cán bộ, Xử lý & Phê duyệt hồ sơ, Đối chiếu biên lai
│   ├── admin/             # Quản lý người dùng, Thủ tục, Lĩnh vực, FAQ, Chatbot AI Settings
│   ├── procedures/        # Tra cứu thủ tục (Phân trang), Chi tiết thủ tục (Hướng dẫn giấy tờ)
│   ├── tracking/          # Tra cứu công khai tiến độ hồ sơ theo mã HS & Quét mã QR
│   ├── notifications/     # Trung tâm thông báo in-app (Phân trang dòng thông báo)
│   ├── faq/               # Cổng tra cứu câu hỏi thường gặp
│   └── chatbot/           # Widget trợ lý ảo AI nổi (Floating Chatbot Widget)
└── app.routes.ts          # Định tuyến phân quyền (AuthGuard, RoleGuard)
```

---

## 🚀 3. Khởi Chạy Khi Lập Trình (Dev Mode)

### Bước 1: Cài đặt thư viện phụ thuộc

```bash
npm install
```

### Bước 2: Khởi động Development Server

```bash
npm start
```

- 🌐 Ứng dụng sẽ chạy tại: **`http://localhost:4200/`**
- Giao diện tự động hot-reload khi có thay đổi mã nguồn.

---

## 📦 4. Đóng Gói Ứng Dụng (Production Build)

```bash
npm run build
```

- **Kết quả đầu ra**: Toàn bộ mã nguồn tĩnh tối ưu hóa (HTML/CSS/JS) được xuất ra thư mục `frontend/dist/`.

