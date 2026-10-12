# ☕ Hướng Dẫn Phát Triển & Build Backend (Spring Boot)

Tài liệu hướng dẫn cấu hình cơ sở dữ liệu, chạy thử (Development), kiểm thử và đóng gói (Build file `.jar`) cho mã nguồn Backend của Hệ thống Dịch vụ công.

---

## 🛠️ 1. Yêu Cầu Môi Trường (Prerequisites)

- **Java JDK**: Version 17 hoặc 21+
- **PostgreSQL**: Version 15+ (Database `dichvucong_db`)
- **Maven Wrapper**: Đã tích hợp sẵn file thực thi `mvnw` / `mvnw.cmd` trong thư mục này.

---

## ⚙️ 2. Cấu Hình Cơ Sở Dữ Liệu & Môi Trường

Kiểm tra cấu hình trong file [src/main/resources/application.yml](src/main/resources/application.yml):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dichvucong_db
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SPRING_MAIL_USERNAME:your_email@gmail.com}
    password: ${SPRING_MAIL_PASSWORD:your_16_char_app_password}

jwt:
  secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  expiration: 86400000 # 24 giờ

gemini:
  api-key: ${GEMINI_API_KEY:your_api_key_here}
  model: ${GEMINI_MODEL:gemini-2.0-flash-lite}
```

---

## 🚀 3. Khởi Chạy Khi Lập Trình (Dev Mode)

Mở terminal tại thư mục `backend` và chạy:

- **Trên Windows (PowerShell / CMD)**:

  ```powershell
  .\mvnw.cmd spring-boot:run
  ```

- **Trên Linux / MacOS**:

  ```bash
  ./mvnw spring-boot:run
  ```

- 🌐 Backend API sẽ chạy tại: **`http://localhost:8080/api`**
- `DataInitializer` sẽ tự động tạo bảng và nạp dữ liệu mẫu (Roles, Admin, Cán bộ, Công dân, Danh mục, Thủ tục, FAQs, Chatbot Persona).

---

## 🔑 4. Tài Khoản Mẫu Đăng Nhập

- **Admin**: `admin@dichvucong.gov.vn` (hoặc `admin`) / `Admin@123`
- **Cán bộ (Staff)**: `staff_001` (hoặc `canbo@dichvucong.gov.vn`) / `Staff@123`
- **Công dân (Citizen)**: `nguyenvana@gmail.com` (hoặc `nguyenvana`) / `User@123`

---

## 📦 5. Đóng Gói (Build) Thành File `.jar`

Khi muốn đóng gói backend để triển khai hoặc gửi nộp đồ án:

```powershell
.\mvnw.cmd clean package -DskipTests
```

- **Kết quả đầu ra**: File `.jar` nằm tại `target/backend-0.0.1-SNAPSHOT.jar`.
- **Lệnh chạy**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

---

## 🧪 6. Chạy Kiểm Thử (Unit Tests)

```powershell
.\mvnw.cmd test
```
