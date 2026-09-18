# 🗄️ HƯỚNG DẪN THIẾT LẬP CƠ SỞ DỮ LIỆU BẰNG DBEAVER (POSTGRESQL)

Tài liệu này hướng dẫn chi tiết cách cấu hình, tạo Database và quản lý cơ sở dữ liệu **PostgreSQL 15+** bằng công cụ **DBeaver**.

---

## 1. Thông số kết nối Database

| Thông số | Giá trị mặc định |
|---|---|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `dichvucong_db` |
| **Username** | `postgres` |
| **Password** | `postgres` (hoặc mật khẩu bạn đã đặt khi cài đặt) |

---

## 2. Các bước tạo Database trên DBeaver

### Bước 1: Tạo kết nối mới (New Connection)
1. Mở **DBeaver**.
2. Nhấp vào icon **New Database Connection** (phím tắt: `Ctrl + Shift + N`) hoặc chọn menu `Database` > `New Database Connection`.
3. Chọn driver **PostgreSQL** > bấm **Next**.
4. Nhập thông tin kết nối:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `postgres` (kết nối tạm vào database mặc định để tạo DB mới)
   - **Username**: `postgres`
   - **Password**: *(nhập mật khẩu của bạn)*
5. Bấm nút **Test Connection...** để kiểm tra kết nối:
   - *(Nếu DBeaver yêu cầu tải PostgreSQL Driver, bấm **Download** để DBeaver tự động cài)*.
6. Bấm **Finish**.

---

### Bước 2: Tạo Database `dichvucong_db`

Bạn có thể làm theo 1 trong 2 cách sau:

#### Cách 2.1: Dùng giao diện trực quan (GUI)
1. Trong cửa sổ **Database Navigator** bên trái, mở rộng kết nối PostgreSQL vừa tạo.
2. Nhấp chuột phải vào thư mục **Databases** > chọn **Create New Database**.
3. Điền các thông tin:
   - **Database Name**: `dichvucong_db`
   - **Owner**: `postgres`
   - **Encoding**: `UTF8`
4. Bấm **OK**.

#### Cách 2.2: Dùng SQL Editor
1. Nhấp chuột phải vào kết nối PostgreSQL > chọn **SQL Editor** > **Open SQL Script** (phím tắt: `F3` hoặc `Ctrl + ]`).
2. Dán đoạn lệnh sau và bấm tổ hợp phím `Ctrl + Enter` để thực thi:
   ```sql
   CREATE DATABASE dichvucong_db
       WITH 
       OWNER = postgres
       ENCODING = 'UTF8';
   ```
3. Sau khi tạo xong, nhấp chuột phải vào kết nối > chọn **Edit Connection** > đổi mục **Database** thành `dichvucong_db` > bấm **OK**.

---

## 3. Xem Sơ đồ ERD trực quan trên DBeaver (Hữu ích cho báo cáo thực tập)

Khi Backend Spring Boot khởi chạy, Hibernate sẽ tự động sinh các bảng trong Database `dichvucong_db`. Bạn có thể xuất sơ đồ ERD trực quan rất đẹp trên DBeaver:

1. Trong **Database Navigator**, điều hướng theo đường dẫn:  
   `dichvucong_db` > `Schemas` > `public`.
2. **Double click** vào schema `public`.
3. Ở khung bên phải, chọn tab **ER Diagram**.
4. DBeaver sẽ tự động hiển thị sơ đồ quan hệ giữa tất cả các bảng (`users`, `roles`, `applications`, `procedures`,...).
5. Bạn có thể nhấn chuột phải vào sơ đồ > chọn **Export diagram...** để lưu ảnh định dạng PNG/SVG chèn vào báo cáo thực tập.

---

## 4. Cấu hình kết nối trong Backend Spring Boot

Đảm bảo file `backend/src/main/resources/application.properties` khớp với thông tin bạn đã cấu hình trên DBeaver:

```properties
# ==============================================================================
# Database Configuration (PostgreSQL)
# ==============================================================================
spring.datasource.url=jdbc:postgresql://localhost:5432/dichvucong_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Upload File Limit
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=20MB
```
