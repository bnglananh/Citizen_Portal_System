# 🧪 KẾ HOẠCH KIỂM THỬ (TESTING PLAN)

## 1. Các cấp độ kiểm thử
- **Unit Test (JUnit 5 + Mockito)**:
  - `AuthService`: Kiểm tra logic đăng ký, đăng nhập, mã hóa mật khẩu, sinh JWT.
  - `ProcedureService`: Kiểm tra tìm kiếm, lọc danh mục.
  - `ApplicationService`: Kiểm tra chặt chẽ tính đúng đắn của State Transition, kiểm tra quyền sở hữu (Ownership).
  - `NotificationService`: Kiểm tra tự động tạo thông báo khi đổi trạng thái.
  - `ChatbotService`: Kiểm tra build prompt ngữ cảnh và parse kết quả.
- **API & Integration Test (Postman / Swagger / MockMvc)**:
  - Kiểm thử các kịch bản: `Success`, `Validation Error (400)`, `Unauthorized (401)`, `Forbidden (403)`, `Not Found (404)`, `Conflict State (409)`.
  - Luồng tích hợp: Chuỗi `Create Application → Upload Document → Submit → Review → History → Notification`.

---

## 2. Các kịch bản kiểm thử trọng yếu (Critical System Test Cases)
1. **Xác thực**: Đăng nhập đúng/sai thông tin, token hết hạn, refresh token.
2. **Nộp hồ sơ**: Nộp đủ thành phần tài liệu, nộp thiếu tài liệu bắt buộc (báo lỗi).
3. **Vòng đời xử lý**: Cán bộ yêu cầu bổ sung → Công dân nhận thông báo & nộp lại → Cán bộ hoàn tất.
4. **Phân quyền & Chống IDOR**:
   - Citizen cố tình gọi API của Admin hoặc Staff ➔ Trả về `403 Forbidden`.
   - Citizen A cố tình truy cập hoặc sửa hồ sơ của Citizen B ➔ Trả về `403 Forbidden` hoặc `404 Not Found`.
5. **Chatbot AI**: Cung cấp câu hỏi thường gặp, chatbot tra cứu đúng FAQ, giải thích trạng thái hồ sơ chính xác mà không tự bịa đặt thông tin.

---

## 3. Tiêu chí hoàn thành (Definition of Done - DoD)
Một chức năng được xem là hoàn tất khi:
1. Giao diện (UI) đúng thiết kế và chạy mượt mà trên trình duyệt.
2. API Backend hoạt động ổn định, validate dữ liệu 2 lớp đầy đủ.
3. Phân quyền và bảo mật (Role + Ownership) được kiểm tra kỹ càng.
4. Dữ liệu trong cơ sở dữ liệu lưu trữ đúng quan hệ và ràng buộc.
5. Xử lý lỗi (Error handling) chuẩn hóa và trả về đúng HTTP Status Code.
6. Không còn lỗi nghiêm trọng (Critical/High bugs).
