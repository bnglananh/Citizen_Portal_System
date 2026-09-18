# 🔒 BẢO MẬT & PHÂN QUYỀN (SECURITY & AUTHORIZATION)

## 1. Cơ chế xác thực & Mật khẩu
- **Mật khẩu**: Băm bảo mật bằng BCrypt (`PasswordEncoder`).
- **JWT (JSON Web Token)**: Access Token có thời hạn ngắn, giải mã thông tin Role ở Header/Payload.

---

## 2. Phân quyền đa tầng & Chống IDOR (Insecure Direct Object References)
- **Role-based Authorization**: Sử dụng `@PreAuthorize("hasRole('CITIZEN')")`, `@PreAuthorize("hasRole('STAFF')")`, `@PreAuthorize("hasRole('ADMIN')")`.
- **Ownership Verification (Chống IDOR)**: 
  - Tại tầng Service, luôn kiểm tra quyền sở hữu đối với tài nguyên.
  - Ví dụ: `application.getCitizenId().equals(currentUser.getId())` để đảm bảo Citizen A không bao giờ xem hay chỉnh sửa được hồ sơ của Citizen B bằng cách sửa `id` trên URL/API.

---

## 3. Quy chuẩn Upload File an toàn
- **Xác thực định dạng thực tế**: Kiểm tra extension và MIME type thực tế của file (Magic Bytes), không tin header `Content-Type` do client gửi lên.
- **Giới hạn dung lượng**: Cấu hình giới hạn kích thước tối đa cho mỗi file upload (ví dụ: max 10MB/file).
- **Tên file & Đường dẫn**: Backend tự động sinh tên file ngẫu nhiên / UUID (`applicationId/uuid_filename`), tuyệt đối không dùng tên file hoặc đường dẫn gốc do client gửi để lưu trữ.

---

## 4. Quản lý Bí mật (Secrets) & CORS
- **Secrets**: `GEMINI_API_KEY`, `DB_PASSWORD`, `JWT_SECRET` bắt buộc đặt trong biến môi trường hoặc file cấu hình `application-local.yml` (đã được thêm vào `.gitignore`).
- **Log an toàn**: Không log password, token, API key ra console hay file log.
- **CORS**: Chỉ cho phép các origin cụ thể của Frontend (ví dụ `http://localhost:4200`), không dùng wildcard `*` khi có `allowCredentials(true)`.
