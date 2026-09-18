# 🗄️ THIẾT KẾ CƠ SỞ DỮ LIỆU (POSTGRESQL)

## 1. Sơ đồ ERD Tổng Quát

```text
roles ─┬─ user_roles ─┬─ users ─┬─ applications ─┬─ application_documents
       │              │         │                ├─ application_history
       │              │         │                └─ notifications
       │              │         ├─ notifications
       │              │         └─ chat_conversations ─ chat_messages
       │              │
procedure_categories ─ procedures ─┬─ procedure_required_documents
                                    └─ applications

faqs (bảng độc lập phục vụ tra cứu công khai & context Chatbot AI)
chatbot_settings (bảng lưu cấu hình tham số hệ thống và persona xưng hô của AI)
```

---

## 2. Danh Sách Các Bảng Trong Cơ Sở Dữ Liệu

| Tên Bảng | Ý nghĩa & Vai trò |
| :--- | :--- |
| `users` | Tài khoản người dùng (Dùng chung cho Citizen, Staff, Admin, phân quyền qua quan hệ roles) |
| `roles` | Danh mục vai trò trong hệ thống (`ROLE_CITIZEN`, `ROLE_STAFF`, `ROLE_ADMIN`) |
| `user_roles` | Bảng liên kết quan hệ nhiều - nhiều giữa `users` và `roles` |
| `procedure_categories` | Danh mục / Lĩnh vực thủ tục hành chính (Tư pháp, Hộ tịch, Đất đai...) |
| `procedures` | Danh mục thủ tục hành chính chi tiết (tên, phí, thời hạn giải quyết, căn cứ pháp lý) |
| `procedure_required_documents` | Danh mục các loại tài liệu/giấy tờ cần nộp của từng thủ tục (`is_required`, file mẫu) |
| `applications` | **Bảng trung tâm** — Lưu trữ hồ sơ hành chính do công dân nộp, mã duy nhất `HS{yyyy}{sequence}` |
| `application_documents` | Danh sách tệp đính kèm của hồ sơ (lưu đường dẫn `file_path`, dung lượng, định dạng file) |
| `application_history` | Nhật ký thay đổi trạng thái hồ sơ — phục vụ hiển thị Timeline (**Append-only**) |
| `notifications` | Danh sách thông báo in-app gửi tới từng người dùng |
| `chat_conversations` | Các phiên hội thoại chat giữa người dùng và trợ lý ảo AI |
| `chat_messages` | Từng tin nhắn hỏi/đáp trong phiên hội thoại AI |
| `faqs` | Bộ câu hỏi & câu trả lời thường gặp (phân loại theo danh mục) |
| `chatbot_settings` | Bảng cấu hình tham số trợ lý AI (phong cách xưng hô `PERSONA_TONE`, mô hình, nhiệt độ) |

---

## 3. Các Quy Chuẩn & Ràng Buộc Cơ Sở Dữ Liệu

1. **`applications.status`**:
   - Sử dụng kiểu dữ liệu ENUM (`DRAFT`, `SUBMITTED`, `IN_PROGRESS`, `NEED_REVISION`, `RESUBMITTED`, `REJECTED`, `COMPLETED`).
   - Mọi chuyển đổi trạng thái phải tuân thủ nghiêm ngặt máy trạng thái (State Machine) ở Service Layer.

2. **`applications.application_code`**:
   - Có chỉ mục UNIQUE (`idx_applications_code`).
   - Tự động sinh mã theo quy tắc `HS{yyyy}{sequence}` (VD: `HS202600001`) để tra cứu công khai, chống dò quét ID tuần tự (IDOR).

3. **`application_documents.file_path`**:
   - Backend tự động sinh đường dẫn lưu trữ ngẫu nhiên dạng `applications/{applicationId}/{uuid}_{filename}`, tuyệt đối không dùng đường dẫn gốc từ client.

4. **Trường Audit (`created_at`, `updated_at`)**:
   - Tất cả các bảng nghiệp vụ đều được tự động điền giá trị thời gian thông qua Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`).

5. **Bảo toàn Audit Log (`application_history`)**:
   - Bảng này hoạt động theo nguyên tắc **Append-only** (chỉ INSERT), nghiêm cấm mọi thao tác UPDATE hoặc DELETE tại tầng Service.

