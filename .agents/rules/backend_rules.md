# ☕ QUY TẮC BACKEND (SPRING BOOT / JAVA)

## 1. Tổ chức Package theo Feature
Không tổ chức package theo layer toàn cục, bắt buộc tổ chức theo feature:
```text
src/main/java/com/example/citizenportal/ (hoặc com.citizenportal.backend)
├── config/          # SecurityConfig, CorsConfig, GeminiConfig, JacksonConfig
├── security/        # JwtAuthenticationFilter, JwtService, CustomUserDetailsService
├── auth/            # controller / service / dto
├── user/            # quản lý user + profile
├── procedure/        # category + procedure + required documents
├── application/      # module trung tâm: entity/dto/service/controller/mapper
├── notification/
├── dashboard/        # thống kê
├── chatbot/          # controller/service/client (gọi Gemini) /dto
├── faq/
└── common/
    ├── exception/    # GlobalExceptionHandler, custom exceptions
    ├── response/     # ApiResponse<T> chuẩn hoá
    ├── validation/
    └── util/
```

---

## 2. Quy chuẩn Layering & DTO (Bắt buộc)
**Layering theo từng module:**
```text
Controller  → nhận request, validate @Valid, KHÔNG chứa business logic
    ↓
Service     → business logic, kiểm tra quyền/trạng thái, @Transactional
    ↓
Repository  → Spring Data JPA, chỉ truy vấn
    ↓
PostgreSQL
```

**Bắt buộc dùng DTO — Không bao giờ trả Entity ra ngoài API:**
- **Request**: `Angular JSON → RequestDTO → Service → Entity → Repository`
- **Response**: `Entity → Mapper (MapStruct hoặc thủ công) → ResponseDTO → Angular`
- Tránh lộ thông tin nhạy cảm, tránh LazyInitializationException.

---

## 3. Vòng đời hồ sơ & State Machine (Strict Rules)
```text
DRAFT → SUBMITTED → RECEIVED → PROCESSING ─┬─→ COMPLETED
                                            ├─→ REJECTED
                                            └─→ NEED_REVISION → RESUBMITTED → PROCESSING
```

| Trạng thái | Ý nghĩa |
|---|---|
| `DRAFT` | Đang tạo, chưa gửi |
| `SUBMITTED` | Người dân đã gửi |
| `RECEIVED` | Cán bộ đã tiếp nhận |
| `PROCESSING` | Đang xử lý |
| `NEED_REVISION` | Cần bổ sung |
| `RESUBMITTED` | Đã bổ sung & gửi lại |
| `REJECTED` | Bị từ chối (bắt buộc có lý do) |
| `COMPLETED` | Hoàn tất |

- **Rule bắt buộc**: Transition phải được định nghĩa cứng trong code (`Map<Status, Set<Status>>` hoặc enum method `canTransitionTo()`).
- Service phải kiểm tra trạng thái hiện tại trước khi update — **không tin dữ liệu trạng thái đích do FE gửi lên**. (Ví dụ: `SUBMITTED → COMPLETED` trực tiếp là không hợp lệ, phải chặn ở Service bằng lỗi 409/422).
- Mọi thao tác nộp / tiếp nhận / xử lý / bổ sung / từ chối / hoàn tất phải ghi 1 bản ghi `application_history` + tạo `notification` tương ứng, trong cùng transaction (`@Transactional`).

---

## 4. Bảo mật & Authorization (Chống IDOR)
- **Password**: Băm bằng BCrypt (`PasswordEncoder`).
- **Phân quyền 2 lớp**: Phân quyền theo Role (`@PreAuthorize`) và theo **Ownership** (kiểm tra `application.citizenId == currentUser.id` trong Service) để chống IDOR.
- **Upload File**:
  - Kiểm tra extension + MIME thật (không tin content-type client gửi).
  - Giới hạn dung lượng file.
  - Backend tự sinh tên file ngẫu nhiên / UUID (`applicationId/uuid_filename`), **không** dùng tên gốc hoặc path do client gửi.
- **Secrets & Credentials**:
  - `GEMINI_API_KEY`, `DB_PASSWORD`, `JWT_SECRET` phải để trong biến môi trường hoặc file `application-local.yml` (đã được cấu hình `.gitignore`).
  - Tuyệt đối không log password, token, API key.
- **Chatbot Gemini Integration**:
  - Backend tự truy vấn dữ liệu hồ sơ thuộc quyền của user hiện tại, xây dựng context tối thiểu rồi mới gửi sang Gemini.
  - Gemini không bao giờ tự truy cập trực tiếp vào DB.
