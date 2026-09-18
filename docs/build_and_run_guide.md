# 🚀 HƯỚNG DẪN CÀI ĐẶT, KHỞI CHẠY & BUILD TOÀN BỘ HỆ THỐNG

Tài liệu này tổng hợp toàn bộ các bước từ chuẩn bị Cơ sở dữ liệu, chạy mã nguồn khi lập trình (Development) cho đến đóng gói (Production Build) cho cả **Frontend** và **Backend**.

---

## 📑 MỤC LỤC
1. [Yêu Cầu Môi Trường](#1-yêu-cầu-môi-trường)
2. [Thiết Lập Database (PostgreSQL & DBeaver)](#2-thiết-lập-database-postgresql--dbeaver)
3. [Khởi Chạy & Build Backend (Spring Boot)](#3-khởi-chạy--build-backend-spring-boot)
4. [Khởi Chạy & Build Frontend (Angular)](#4-khởi-chạy--build-frontend-angular)
5. [Sử Dụng Tác Vụ Tự Động Trong VS Code](#5-sử-dụng-tác-vụ-tự-động-trong-vs-code)
6. [Bảng Tra Cứu Lệnh Nhanh](#6-bảng-tra-cứu-lệnh-nhanh)

---

## 1. Yêu Cầu Môi Trường
- **Java JDK**: Version 17 hoặc 21+ (Cài đặt JDK từ Oracle/OpenJDK)
- **Node.js**: Version 20.x trở lên
- **Angular CLI**: Version 19+ (`npm install -g @angular/cli`)
- **Database**: PostgreSQL 15+ & công cụ quản lý **DBeaver** (hoặc Docker)

---

## 2. Thiết Lập Database (PostgreSQL & DBeaver)

### Thông số kết nối chuẩn:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `dichvucong_db`
- **User / Password**: `postgres` / `postgres` *(hoặc mật khẩu do bạn đặt)*

### Các bước tạo Database:
1. Mở **DBeaver**, kết nối tới PostgreSQL (`Ctrl + Shift + N`).
2. Mở trình soạn thảo **SQL Editor** (`F3` hoặc `Ctrl + ]`).
3. Chạy lệnh tạo database:
   ```sql
   CREATE DATABASE dichvucong_db WITH OWNER = postgres ENCODING = 'UTF8';
   ```
> 💡 Khi Backend khởi chạy, JPA/Hibernate sẽ tự động tạo cấu trúc toàn bộ 11 bảng vào Database này.

---

## 3. Khởi Chạy & Build Backend (Spring Boot)

Mã nguồn nằm trong thư mục `backend/`.

### 3.1. Chạy Backend khi lập trình (Dev Server):
```powershell
cd backend

# Windows:
.\mvnw.cmd spring-boot:run

# Linux / MacOS:
./mvnw spring-boot:run
```
- 🌐 **Backend API:** `http://localhost:8080`

### 3.2. Đóng gói (Build) thành file `.jar`:
```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
```
- **File sinh ra:** `backend/target/backend-0.0.1-SNAPSHOT.jar`
- **Chạy file độc lập:**
  ```powershell
  java -jar target/backend-0.0.1-SNAPSHOT.jar
  ```

---

## 4. Khởi Chạy & Build Frontend (Angular)

Mã nguồn nằm trong thư mục `frontend/`.

### 4.1. Cài đặt thư viện (Chạy 1 lần đầu):
```powershell
cd frontend
npm install
```

### 4.2. Chạy Frontend khi lập trình (Dev Server):
```powershell
cd frontend
npm start
```
- 🌐 **Giao diện Web:** `http://localhost:4200`
- Tự động tải lại trang khi bạn chỉnh sửa và lưu code.

### 4.3. Đóng gói (Build) thành phẩm (Production):
```powershell
cd frontend
npm run build
```
- **Thư mục sinh ra:** `frontend/dist/` (chứa toàn bộ file tĩnh HTML, CSS, JS đã được nén và tối ưu).

---

## 5. Sử Dụng Tác Vụ Tự Động Trong VS Code

Nếu bạn sử dụng VS Code, bạn có thể chạy mà không cần gõ lệnh thủ công:
1. Nhấn tổ hợp phím **`Ctrl + Shift + P`**
2. Gõ **`Tasks: Run Task`**
3. Chọn tác vụ mong muốn:
   - `Start Frontend (Angular)`
   - `Start Backend (Spring Boot)`
   - `Build Frontend`
   - `Build Backend`

---

## 6. Bảng Tra Cứu Lệnh Nhanh

| Thành phần | Thao tác | Câu lệnh thực thi |
|---|---|---|
| **Database** | Tạo CSDL | DBeaver: `CREATE DATABASE dichvucong_db;` |
| **Backend** | Chạy lập trình (Dev) | `cd backend` ➔ `.\mvnw.cmd spring-boot:run` |
| **Backend** | Đóng gói (.jar) | `cd backend` ➔ `.\mvnw.cmd clean package -DskipTests` |
| **Frontend** | Cài thư viện | `cd frontend` ➔ `npm install` |
| **Frontend** | Chạy lập trình (Dev) | `cd frontend` ➔ `npm start` |
| **Frontend** | Đóng gói (Build dist) | `cd frontend` ➔ `npm run build` |
