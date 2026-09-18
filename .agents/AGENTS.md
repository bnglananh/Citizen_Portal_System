# 🤖 CẨM NANG CHỈ DẪN AI CHO DỰ ÁN (PROJECT AI INSTRUCTIONS)

> **Mục đích**: File này định nghĩa các nguyên tắc, tiêu chuẩn mã nguồn, và hướng dẫn cho AI Agent khi hỗ trợ phát triển dự án *Hệ Thống Dịch Vụ Công*.

---

## 📌 1. TỔNG QUAN DỰ ÁN & VAI TRÒ
Bạn đang hỗ trợ xây dựng **Hệ thống hỗ trợ đăng ký và theo dõi thủ tục hành chính trực tuyến tại phường/xã** (đồ án thực tập), tích hợp trợ lý AI. Hệ thống gồm 3 vai trò: **Citizen** (người dân), **Staff** (cán bộ xử lý hồ sơ), **Admin** (quản trị hệ thống). Trọng tâm là quản lý **vòng đời hồ sơ hành chính**, chatbot chỉ là module hỗ trợ tra cứu/hướng dẫn, không thay thế nghiệp vụ. Dữ liệu, thủ tục là giả lập, không dùng dữ liệu/tài khoản thật.

**Ngăn xếp công nghệ bắt buộc:**
- Backend: Java 17+, Spring Boot 4.x, Spring Security + JWT, Spring Data JPA
- Frontend: Angular 17+, NG-ZORRO (Ant Design for Angular)
- Database: PostgreSQL 15+
- AI: Gemini API (gọi qua backend, không lộ key ra FE)
- Test: JUnit5 + Mockito, Postman/Swagger, Karma/Jasmine

**Vai trò của AI**: đóng vai **Senior Fullstack Developer**, thông thạo Spring Boot + Angular + PostgreSQL, có tư duy bảo mật (chống IDOR, không tin dữ liệu từ client). Khi được hỏi một tính năng mới, phải tự đối chiếu với các quy tắc trong file này trước khi đề xuất code, và chỉ rõ nếu đề xuất của người dùng vi phạm nguyên tắc nào.

---

## ☕ 2. QUY TẮC BACKEND (SPRING BOOT / JAVA)
**Tổ chức package theo feature** (không theo layer toàn cục):

com.example.citizenportal/
├── config/ # SecurityConfig, CorsConfig, GeminiConfig, JacksonConfig
├── security/ # JwtAuthenticationFilter, JwtService, CustomUserDetailsService
├── auth/ user/ procedure/ application/ notification/ dashboard/ chatbot/ faq/
└── common/
├── exception/ # GlobalExceptionHandler, custom exceptions
├── response/ # ApiResponse<T> chuẩn hoá
├── validation/ util/


**Layering bắt buộc mỗi module**: `Controller → Service → Repository → Entity`
- Controller: chỉ nhận request, validate `@Valid`, **không** chứa business logic.
- Service: chịu toàn bộ business logic, kiểm tra trạng thái/quyền sở hữu, bọc `@Transactional` cho mọi thao tác đổi trạng thái.
- Repository: chỉ dùng Spring Data JPA để truy vấn.
- **Không bao giờ trả Entity ra ngoài API** — luôn qua DTO + Mapper (MapStruct hoặc thủ công).

**Exception & Logging:**
- Dùng `@RestControllerAdvice` xử lý lỗi tập trung, trả về đúng HTTP status (400/401/403/404/409/422/500).
- Không log password, token, API key.

**Security:**
- Password hash bằng BCrypt.
- Phân quyền theo cả **role** (`@PreAuthorize`) và **ownership** (so sánh `currentUserId` với dữ liệu sở hữu trong Service) — chống IDOR.
- Mọi thay đổi `applications.status` phải kiểm tra transition hợp lệ theo state machine, không tin giá trị đích do client gửi.
- Mọi thao tác nộp/tiếp nhận/xử lý/bổ sung/từ chối/hoàn tất phải ghi 1 bản ghi `application_history` + tạo `notification` tương ứng, trong cùng transaction.
- Upload file: kiểm tra extension + MIME thật, giới hạn dung lượng, sinh tên file random (không dùng tên gốc client gửi).
- Gemini API Key chỉ nằm ở Backend; BE tự truy vấn dữ liệu thuộc quyền user hiện tại rồi mới build context gửi Gemini.



---

## 🅰️ 3. QUY TẮC FRONTEND (ANGULAR / TYPESCRIPT)
**Cấu trúc thư mục:**

src/app/
├── core/ # auth, guards, interceptors (JWT, error), services dùng chung, models
├── shared/ # components dùng lại (upload, timeline, status-tag...), pipes, directives
├── features/
│ ├── auth/ citizen/ staff/ admin/ procedures/ applications/
│ ├── notifications/ dashboard/ chatbot/


**Nguyên tắc:**
- Angular **chỉ** là tầng trình bày — không tự tính hợp lệ chuyển trạng thái hay bất kỳ business rule nào ở FE rồi tin tưởng nó.
- Route theo role qua `RoleGuard` (đọc role từ JWT payload) — chỉ để **ẩn/hiện UI**, không phải cơ chế bảo mật thật; mọi kiểm tra quyền thật sự nằm ở Backend.
- Dùng `HttpInterceptor` tự động gắn `Authorization: Bearer <token>` và xử lý lỗi 401/403 tập trung.
- **UI Library**: dùng NG-ZORRO cho toàn bộ UI — `nz-table` (danh sách + pagination), `nz-steps`/`nz-timeline` (vòng đời hồ sơ), `nz-upload` (đính kèm), `nz-tag` (trạng thái có màu), `nz-statistic`/`nz-card` (dashboard), `nz-drawer`/`nz-modal` (form nhanh), `nz-badge` (số thông báo chưa đọc).
- Angular **không bao giờ** cầm Gemini API Key.

---

## 🗄️ 4. QUY TẮC CƠ SỞ DỮ LIỆU & API
**Đặt tên & thiết kế bảng SQL:**
- `applications.status`: dùng ENUM (Postgres enum type hoặc VARCHAR + CHECK constraint), không để free-text.
- `applications.application_code`: index UNIQUE, sinh theo pattern `HS{yyyy}{sequence}` để tra cứu công khai, tránh lộ ID nội bộ tuần tự (IDOR).
- `application_documents.file_path`: backend tự sinh theo `applicationId/uuid_filename`, không lưu path do client gửi.
- Mọi bảng đều có `created_at`, `updated_at` (dùng `@CreatedDate`/`@LastModifiedDate` của JPA Auditing).
- `application_history` là **append-only** — không cho UPDATE/DELETE ở tầng Service.

**Cấu trúc API (RESTful):**

/api/auth/** /api/users/me /api/admin/users/**
/api/procedure-categories/** /api/procedures/**
/api/applications/** /api/staff/applications/**
/api/applications/{id}/history /api/notifications/**
/api/chat/** /api/dashboard/**


**Chuẩn hóa response bắt buộc:**
- Thành công: `{ success, data, message }`
- Lỗi: `{ success:false, code, message, timestamp }`
- List có pagination: `{ content, page, size, totalElements, totalPages }`



---

## 📝 5. QUY TẮC GIT & COMMIT CONVENTION
> ⚠️ Phần này chưa được định nghĩa trong tài liệu kế hoạch gốc — đây là đề xuất theo chuẩn phổ biến (Conventional Commits), bạn có thể chỉnh lại cho phù hợp với team.

**Branch naming:**
- `feature/<module>-<mo-ta-ngan>` (vd: `feature/application-submit-flow`)
- `fix/<mo-ta-ngan>`
- `refactor/<mo-ta-ngan>`

**Commit message format:** `<type>(<scope>): <mô tả ngắn>`
- `feat`: thêm tính năng mới
- `fix`: sửa lỗi
- `refactor`: tái cấu trúc code, không đổi behavior
- `docs`: chỉ sửa tài liệu
- `test`: thêm/sửa test
- `chore`: việc lặt vặt (cấu hình, dependency...)

Ví dụ: `feat(application): thêm API nộp hồ sơ và ghi application_history`


---

## ⚠️ 6. NHỮNG ĐIỀU CẤM KỴ / LƯU Ý ĐẶC BIỆT
- **Không** đặt Gemini API Key ở Angular — mọi lời gọi Gemini phải đi qua Backend.
- **Không** gửi dữ liệu nhạy cảm (password, token, thông tin không cần thiết) sang Gemini.
- **Không** trả Entity trực tiếp ra API — luôn qua DTO/Mapper.
- **Không** tin trạng thái đích (`status`) do FE gửi lên mà không kiểm tra transition hợp lệ ở Service (vd: `SUBMITTED → COMPLETED` trực tiếp là không hợp lệ, phải chặn bằng lỗi 409/422).
- **Không** tin `file_path` do client gửi trực tiếp khi upload — backend luôn tự sinh path.
- **Không** hardcode secrets (`GEMINI_API_KEY`, `DB_PASSWORD`, `JWT_SECRET`) — luôn dùng biến môi trường / `application-local.yml` không commit, đảm bảo có `.gitignore`.
- **Không** log password/token/API key.
- **Không** dùng CORS `*` khi có credential.
- **Không** implement: ký số thật, thanh toán thật, tích hợp hệ thống nhà nước thật, OCR thật, nhận diện khuôn mặt (ngoài phạm vi MVP).

