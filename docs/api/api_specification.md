# 🌐 THIẾT KẾ RESTful API TỔNG QUÁT

Hệ thống Dịch vụ công trực tuyến sử dụng chuẩn kiến trúc **RESTful API** để trao đổi dữ liệu không đồng bộ giữa Frontend (Angular) và Backend (Spring Boot). Dữ liệu được định dạng hoàn toàn bằng `JSON`.

---

## 1. Danh Sách Các Endpoints Trong Hệ Thống

### 1.1. Module Xác thực & Tài khoản (`/api/auth`, `/api/users`)

- `POST /api/auth/send-register-otp` — Kiểm tra tính hợp lệ và gửi mã OTP 6 số qua Gmail (kèm cooldown 45s, TTL 5 phút)
- `POST /api/auth/register` — Đăng ký tài khoản công dân mới (yêu cầu mã `otp` hợp lệ)
- `POST /api/auth/login` — Đăng nhập hệ thống (trả về JWT Access Token)
- `POST /api/auth/refresh` — Làm mới Access Token khi hết hạn
- `GET /api/users/me` — Lấy thông tin tài khoản của người dùng đang đăng nhập
- `PUT /api/users/me` — Cập nhật thông tin cá nhân (họ tên, SĐT, CCCD, địa chỉ)
- `POST /api/users/change-password` — Đổi mật khẩu tài khoản
- `GET /api/admin/users` — [ADMIN] Danh sách tài khoản (phân trang, tìm kiếm, lọc theo vai trò/trạng thái)
- `POST /api/admin/users` — [ADMIN] Tạo tài khoản Cán bộ (Staff) hoặc Admin
- `PUT /api/admin/users/{id}/status` — [ADMIN] Khóa / Mở khóa tài khoản người dùng

### 1.2. Module Danh mục & Thủ tục Hành chính (`/api/procedure-categories`, `/api/procedures`)

- `GET /api/procedure-categories` — Danh sách lĩnh vực / danh mục thủ tục (Public)
- `POST /api/procedure-categories` — [ADMIN] Tạo mới lĩnh vực
- `PUT /api/procedure-categories/{id}` — [ADMIN] Cập nhật lĩnh vực
- `DELETE /api/procedure-categories/{id}` — [ADMIN] Xóa lĩnh vực
- `GET /api/procedures` — Tra cứu danh sách thủ tục (Public - hỗ trợ lọc theo lĩnh vực, từ khóa, phân trang)
- `GET /api/procedures/{id}` — Xem thông tin chi tiết thủ tục kèm thành phần hồ sơ và biểu mẫu (Public)
- `POST /api/procedures` — [ADMIN] Tạo mới thủ tục hành chính
- `PUT /api/procedures/{id}` — [ADMIN] Cập nhật thủ tục hành chính và danh sách hồ sơ bắt buộc
- `DELETE /api/procedures/{id}` — [ADMIN] Xóa hoặc chuyển trạng thái thủ tục

### 1.3. Module Quản lý Hồ sơ Công dân (`/api/applications`)

- `GET /api/applications` — Danh sách hồ sơ của chính công dân đang đăng nhập
- `GET /api/applications/{id}` — Chi tiết hồ sơ và các tài liệu đính kèm (có kiểm tra quyền sở hữu)
- `POST /api/applications/draft` — Khởi tạo hồ sơ nháp (`DRAFT`)
- `PUT /api/applications/{id}` — Cập nhật dữ liệu biểu mẫu hồ sơ nháp
- `POST /api/applications/{id}/submit` — Nộp hồ sơ chính thức (`SUBMITTED`)
- `POST /api/applications/{id}/documents` — Tải lên tài liệu đính kèm vào hồ sơ
- `DELETE /api/applications/{id}/documents/{docId}` — Xóa tài liệu khỏi hồ sơ nháp
- `POST /api/applications/{id}/resubmit` — Nộp lại hồ sơ sau khi đã bổ sung tài liệu theo yêu cầu (`RESUBMITTED`)
- `GET /api/applications/track/{applicationCode}` — Tra cứu công khai tiến độ hồ sơ theo mã (`HS2026...`)

### 1.4. Module Xử lý Hồ sơ Cán bộ (`/api/staff/applications`)

- `GET /api/staff/applications` — [STAFF/ADMIN] Danh sách toàn bộ hồ sơ cần xử lý (lọc theo trạng thái, từ khóa)
- `GET /api/staff/applications/{id}` — [STAFF/ADMIN] Xem chi tiết hồ sơ để thẩm định
- `POST /api/staff/applications/{id}/receive` — Tiếp nhận hồ sơ (`SUBMITTED` / `RESUBMITTED` ➔ `IN_PROGRESS`)
- `POST /api/staff/applications/{id}/request-revision` — Yêu cầu người dân bổ sung giấy tờ (`IN_PROGRESS` ➔ `NEED_REVISION`)
- `POST /api/staff/applications/{id}/reject` — Từ chối hồ sơ (`IN_PROGRESS` ➔ `REJECTED`)
- `POST /api/staff/applications/{id}/complete` — Phê duyệt & Hoàn tất hồ sơ (`IN_PROGRESS` ➔ `COMPLETED`) kèm đính kèm kết quả

### 1.5. Module Lịch sử xử lý & Thông báo (`/api/applications/{id}/history`, `/api/notifications`)

- `GET /api/applications/{id}/history` — Lấy danh sách lịch sử chuyển đổi trạng thái (Audit Log / Timeline)
- `GET /api/notifications` — Danh sách thông báo in-app của tài khoản hiện tại
- `GET /api/notifications/unread-count` — Đếm số thông báo chưa đọc
- `PUT /api/notifications/{id}/read` — Đánh dấu 1 thông báo là đã đọc
- `PUT /api/notifications/read-all` — Đánh dấu tất cả thông báo là đã đọc

### 1.6. Module Báo cáo & Thống kê Dashboard (`/api/dashboard`)

- `GET /api/dashboard/citizen` — Thống kê tổng hồ sơ, số lượng theo từng trạng thái của công dân
- `GET /api/dashboard/staff` — Thống kê khối lượng công việc, hồ sơ chờ tiếp nhận, đang xử lý của cán bộ
- `GET /api/dashboard/admin` — Thống kê toàn diện hệ thống: tổng người dùng, thủ tục, hồ sơ, biểu đồ trạng thái, biểu đồ xu hướng theo tháng

### 1.7. Module Trợ lý Ảo AI Chatbot & FAQ (`/api/chat`, `/api/faqs`)

- `POST /api/chat/ask` — Gửi câu hỏi cho Trợ lý AI (tích hợp context thủ tục, FAQ và hồ sơ người dùng)
- `GET /api/chat/persona` — Lấy thông tin phong cách xưng hô hiện tại của Chatbot (Public)
- `GET /api/chat/admin/settings` — [ADMIN] Lấy cấu hình xưng hô hiện tại
- `PUT /api/chat/admin/settings` — [ADMIN] Cập nhật phong cách xưng hô cho Chatbot
- `GET /api/faqs` — Lấy danh sách câu hỏi thường gặp FAQ (Public)
- `GET /api/admin/faqs` — [ADMIN] Danh sách câu hỏi FAQ
- `POST /api/admin/faqs` — [ADMIN] Tạo câu hỏi FAQ mới
- `PUT /api/admin/faqs/{id}` — [ADMIN] Cập nhật câu hỏi FAQ
- `DELETE /api/admin/faqs/{id}` — [ADMIN] Xóa câu hỏi FAQ

---

## 2. Quy Chuẩn Response Chuẩn Hóa

### 2.1. Phản hồi thành công (Single Data Response)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "applicationCode": "HS202600001",
    "status": "IN_PROGRESS",
    "procedureName": "Đăng ký khai sinh",
    "createdAt": "2026-09-15T08:30:00Z"
  },
  "message": "Tiếp nhận hồ sơ thành công"
}
```

### 2.2. Phản hồi danh sách có phân trang (Pagination Response)

```json
{
  "content": [ ... ],
  "page": 0,
  "size": 10,
  "totalElements": 50,
  "totalPages": 5,
  "last": false
}
```

### 2.3. Phản hồi lỗi chuẩn hóa (Error Response)

```json
{
  "success": false,
  "code": "INVALID_STATE_TRANSITION",
  "message": "Không thể hoàn tất hồ sơ khi chưa được tiếp nhận xử lý",
  "timestamp": "2026-09-16T15:30:00Z"
}
```

---

## 3. Danh Mục HTTP Status Code Sử Dụng

- **`200 OK`**: Yêu cầu xử lý thành công (GET, PUT, PATCH).
- **`201 Created`**: Tạo mới tài nguyên thành công (POST).
- **`400 Bad Request`**: Dữ liệu gửi lên không hợp lệ (`@Valid` validation fail).
- **`401 Unauthorized`**: Chưa đăng nhập hoặc Token hết hạn / không hợp lệ.
- **`403 Forbidden`**: Không có quyền truy cập vào tài nguyên (sai Role hoặc không phải chủ sở hữu).
- **`404 Not Found`**: Không tìm thấy tài nguyên trong cơ sở dữ liệu.
- **`409 Conflict`**: Xung đột trạng thái (chuyển trạng thái state machine không hợp lệ).
- **`422 Unprocessable Entity`**: Dữ liệu hợp lệ về cú pháp nhưng vi phạm quy tắc nghiệp vụ.
- **`500 Internal Server Error`**: Lỗi hệ thống ngoài ý muốn phía server.

