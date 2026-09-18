# 🅰️ QUY TẮC FRONTEND (ANGULAR / TYPESCRIPT)

## 1. Cấu trúc thư mục (Folder Structure)
```text
src/app/
├── core/            # auth, guards, interceptors (JWT, error), services dùng chung, models
├── shared/          # components dùng lại (upload, timeline, status-tag...), pipes, directives
├── features/
│   ├── auth/
│   ├── citizen/       # dashboard + wrapper cho citizen
│   ├── staff/
│   ├── admin/
│   ├── procedures/    # tra cứu + chi tiết thủ tục
│   ├── applications/  # tạo/nộp/theo dõi hồ sơ
│   ├── notifications/
│   ├── dashboard/
│   └── chatbot/
```

---

## 2. Nguyên tắc & Vai trò của Frontend
1. **Frontend chỉ là tầng trình bày**: Không chứa business rule (không tự tính hợp lệ chuyển trạng thái ở FE rồi tin tưởng nó).
2. **RoleGuard**: Đọc role từ JWT payload đã giải mã ở FE — chỉ để **ẩn/hiện UI**, không phải cơ chế bảo mật thật sự. Mọi kiểm tra bảo mật thật sự nằm ở Backend.
3. **HttpInterceptor**:
   - Tự động gắn header `Authorization: Bearer <token>`.
   - Bắt lỗi `401`/`403` tập trung (điều hướng về trang login hoặc hiển thị `nz-notification`).
4. **Bảo mật Gemini**: Angular **không bao giờ** cầm Gemini API Key. Toàn bộ tính năng chatbot gọi thông qua Backend API.

---

## 3. Quy chuẩn UI Library (NG-ZORRO)
Sử dụng NG-ZORRO (Ant Design for Angular) đồng nhất cho toàn bộ hệ thống:
- `nz-table`: Danh sách dữ liệu, phân trang (pagination), sorting, filtering.
- `nz-steps` / `nz-timeline`: Hiển thị quy trình, vòng đời hồ sơ, nhật ký xử lý.
- `nz-upload`: Giao diện đính kèm tài liệu, upload file.
- `nz-tag`: Hiển thị trạng thái hồ sơ có màu sắc quy chuẩn (ví dụ: `COMPLETED` xanh lá, `REJECTED` đỏ, `PROCESSING` xanh dương, `NEED_REVISION` cam...).
- `nz-statistic` / `nz-card`: Dựng Dashboard, thống kê số liệu cho Citizen / Staff / Admin.
- `nz-drawer` / `nz-modal`: Form thao tác nhanh (tiếp nhận, nhập lý do từ chối, bổ sung).
- `nz-badge`: Hiển thị số lượng thông báo chưa đọc.
