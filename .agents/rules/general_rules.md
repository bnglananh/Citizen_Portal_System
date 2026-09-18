# 🌐 QUY TẮC CHUNG CHO TOÀN BỘ DỰ ÁN (GENERAL RULES)

## 1. Ngăn xếp công nghệ bắt buộc (Tech Stack)
- **Backend**: Java 17+, Spring Boot 3.x / 4.x, Spring Security + JWT, Spring Data JPA
- **Frontend**: Angular 17+, NG-ZORRO (Ant Design for Angular)
- **Database**: PostgreSQL 15+
- **AI**: Gemini API (gọi qua backend, không lộ key ra FE)
- **Test**: JUnit5 + Mockito, Postman/Swagger, Karma/Jasmine

---

## 2. Nguyên tắc kiến trúc cốt lõi
1. Angular **chỉ** là tầng trình bày — không chứa business rule (không tự tính hợp lệ chuyển trạng thái ở FE rồi tin tưởng nó).
2. Toàn bộ business logic, transition trạng thái, phân quyền nằm ở Spring Boot.
3. Angular **không bao giờ** cầm Gemini API Key. Toàn bộ lời gọi Gemini đi qua Backend.
4. Không gửi dữ liệu nhạy cảm (password, token, thông tin không cần thiết) sang Gemini.
5. Backend luôn kiểm tra quyền (role + ownership) ở tầng Service, kể cả khi FE đã ẩn nút bấm.
6. Mọi thao tác đổi trạng thái hồ sơ phải là **1 transaction** duy nhất (`@Transactional`), có ghi history + notification.

---

## 3. Quy chuẩn API Response & Mã lỗi
- **Response thành công**:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Thông điệp thành công"
  }
  ```
- **Response lỗi**:
  ```json
  {
    "success": false,
    "code": "ERROR_CODE",
    "message": "Mô tả chi tiết lỗi",
    "timestamp": "2026-09-14T00:00:00Z"
  }
  ```
- **Danh sách có phân trang**:
  ```json
  {
    "content": [],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
  ```
- **HTTP Status Code chuẩn**: `400` (Bad Request), `401` (Unauthorized), `403` (Forbidden), `404` (Not Found), `409` (Conflict), `422` (Unprocessable Entity), `500` (Internal Server Error) — xử lý tập trung qua `@RestControllerAdvice`.

---

## 4. Giao tiếp & Tác phong phản hồi của AI
- AI trả lời bằng **tiếng Việt** khi giải thích, tư vấn kiến trúc/nghiệp vụ; code và tên biến/class giữ nguyên **tiếng Anh**.
- Khi đề xuất code cho một tính năng mới, AI phải tự đối chiếu với các nguyên tắc trong dự án trước khi xuất code và chỉ rõ nếu đề xuất của người dùng vi phạm nguyên tắc bảo mật/kiến trúc.
- Không tự ý thêm dependency mới ngoài ngăn xếp công nghệ đã cố định.