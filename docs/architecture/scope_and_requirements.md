# 🎯 MỤC TIÊU & PHẠM VI DỰ ÁN (MVP & SCOPE)

## 1. Mục tiêu dự án

Xây dựng hệ thống dịch vụ công trực tuyến cấp phường/xã, gồm 3 vai trò (**Citizen**, **Staff**, **Admin**) và 1 trợ lý ảo AI (Google Gemini 2.0 Flash Lite) hỗ trợ tra cứu/hướng dẫn. Trọng tâm là **quản lý vòng đời hồ sơ hành chính** và số hóa quy trình tiếp nhận, xử lý, phê duyệt hồ sơ dịch vụ công.

> **Lưu ý:** Toàn bộ dữ liệu người dùng, hồ sơ và thủ tục là **dữ liệu mô phỏng / giả lập**, không sử dụng dữ liệu thật.

---

## 2. Phạm vi MVP & Mức Độ Hoàn Thành (100% Đã Hoàn Thành)

| Nhóm chức năng | Các chức năng chi tiết | Trạng thái |
| :--- | :--- | :--- |
| **AUTH & USER** | Đăng ký, đăng nhập JWT, đổi mật khẩu, xem/sửa hồ sơ cá nhân | ✅ Hoàn thành |
| **PROCEDURE** | Quản lý lĩnh vực, danh sách thủ tục, tìm kiếm/lọc, chi tiết 5 tabs | ✅ Hoàn thành |
| **APPLICATION** | Tạo nháp (`DRAFT`), upload tài liệu, nộp (`SUBMITTED`), timeline, bổ sung (`RESUBMITTED`) | ✅ Hoàn thành |
| **PUBLIC TRACKING** | Tra cứu tiến độ hồ sơ công khai theo mã `HS{yyyy}{sequence}` | ✅ Hoàn thành |
| **STAFF** | Dashboard, danh sách hồ sơ, tiếp nhận (`IN_PROGRESS`), yêu cầu bổ sung, từ chối, hoàn tất | ✅ Hoàn thành |
| **ADMIN** | Quản lý người dùng (khóa/mở), quản lý thủ tục, lĩnh vực, quản lý bộ FAQ | ✅ Hoàn thành |
| **NOTIFICATION** | Hệ thống thông báo in-app kèm số đếm chưa đọc (Badge), đánh dấu đã đọc | ✅ Hoàn thành |
| **DASHBOARD** | Thống kê số liệu chuyên biệt theo từng vai trò (Citizen, Staff, Admin) | ✅ Hoàn thành |
| **AI CHATBOT** | Gemini 2.0 Flash Lite, RAG context (thủ tục, FAQ, hồ sơ cá nhân), fallback tức thì | ✅ Hoàn thành |
| **AI PERSONA** | Admin tùy chỉnh phong cách xưng hô của Chatbot (Trợ lý, Thân thiện, Trang trọng) | ✅ Hoàn thành |
| **PUBLIC FAQ** | Cổng tra cứu câu hỏi thường gặp cho người dân kèm bộ lọc theo danh mục | ✅ Hoàn thành |

---

## 3. Các Tính Năng Nâng Cao Đã Tích Hợp (Beyond MVP)

- Tích hợp động cơ Fallback AI nội bộ dự phòng khi mất kết nối mạng.
- Giao diện Admin cấu hình phong cách xưng hô AI kèm Live Chat Preview.
- Caching dữ liệu FAQ tối ưu tốc độ phản hồi 0ms.
- Bảo mật 2 lớp: `@PreAuthorize` (Role-based) kết hợp kiểm tra quyền sở hữu (Ownership Validation) chống IDOR.

---

## 4. Phạm Vi Ngoài Dự Án (Out of scope)

- Ký số phần cứng / USB Token thật.
- Cổng thanh toán trực tuyến tiền mặt thật qua ngân hàng.
- Tích hợp cơ sở dữ liệu quốc gia về dân cư thật (VNeID).
- Nhận diện sinh trắc học / eKYC khuôn mặt thật.

