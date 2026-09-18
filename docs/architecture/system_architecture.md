# 🏗️ KIẾN TRÚC TỔNG THỂ HỆ THỐNG

## 1. Sơ đồ kiến trúc tổng quát

```text
┌───────────────────────────────────────────────────────────┐
│                    ANGULAR + NG-ZORRO                     │
│   Citizen Portal │ Staff Portal │ Admin Portal │ Chatbot UI│
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / REST API (JSON)
                              ▼
┌───────────────────────────────────────────────────────────┐
│                     SPRING BOOT (BE)                      │
│  Security/JWT → Controller → Service → Repository          │
│  DTO/Mapper, Validation, Global Exception Handler         │
│  File Storage, Notification, Gemini Client                │
└───────────────┬───────────────────────────────┬───────────┘
                │                               │
                ▼                               ▼
      ┌──────────────────┐          ┌─────────────────────┐
      │    PostgreSQL    │          │     Gemini API      │
      │  users/procedures│          │  Chat/FAQ guidance  │
      │  applications/...│          │  (gọi qua BE only)  │
      └──────────────────┘          └─────────────────────┘
```

---

## 2. Nguyên tắc kiến trúc cốt lõi
1. **Angular chỉ là tầng trình bày**: Không chứa business rule (ví dụ: không tự tính hợp lệ chuyển trạng thái ở FE rồi tin tưởng nó).
2. **Toàn bộ business logic, transition trạng thái, phân quyền nằm ở Spring Boot**.
3. **Angular không bao giờ cầm Gemini API Key**: Toàn bộ lời gọi Gemini đi qua Backend.
4. **Bảo mật thông tin**: Không gửi dữ liệu nhạy cảm (password, token, thông tin không cần thiết) sang Gemini.
5. **Kiểm tra quyền đa tầng**: Backend luôn kiểm tra quyền (role + ownership) ở tầng Service, kể cả khi FE đã ẩn nút bấm.
6. **Transaction an toàn**: Mọi thao tác đổi trạng thái hồ sơ phải là **1 transaction** duy nhất (`@Transactional`), có ghi history + notification đồng thời.
