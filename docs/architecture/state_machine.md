# 🔄 VÒNG ĐỜI HỒ SƠ & STATE MACHINE

## 1. Sơ đồ chuyển đổi trạng thái

```text
DRAFT → SUBMITTED → RECEIVED → PROCESSING ─┬─→ COMPLETED
                                            ├─→ REJECTED
                                            └─→ NEED_REVISION → RESUBMITTED → PROCESSING
```

---

## 2. Bảng định nghĩa các trạng thái

| Trạng thái | Ý nghĩa | Người thực hiện |
|---|---|---|
| `DRAFT` | Đang tạo, lưu nháp, chưa gửi | Citizen |
| `SUBMITTED` | Người dân đã nộp hồ sơ chính thức | Citizen |
| `RECEIVED` | Cán bộ đã tiếp nhận hồ sơ | Staff |
| `PROCESSING` | Hồ sơ đang trong quá trình thẩm định / xử lý | Staff |
| `NEED_REVISION` | Hồ sơ thiếu/sai tài liệu, yêu cầu công dân bổ sung (bắt buộc kèm lý do) | Staff |
| `RESUBMITTED` | Công dân đã bổ sung tài liệu & gửi lại | Citizen |
| `REJECTED` | Từ chối giải quyết hồ sơ (bắt buộc kèm lý do) | Staff |
| `COMPLETED` | Hồ sơ đã xử lý hoàn tất (có thể đính kèm file kết quả) | Staff |

---

## 3. Quy tắc kiểm soát chuyển đổi (State Transition Rules)
- **Định nghĩa cứng trong code**: State transition được khai báo dạng cấu trúc dữ liệu (`Map<Status, Set<Status>>` hoặc enum method `canTransitionTo()`).
- **Xác thực tại Service**: Backend Service bắt buộc kiểm tra trạng thái hiện tại trước khi cập nhật — **không tin dữ liệu trạng thái đích do Client gửi lên**.
- **Chặn chuyển đổi bất hợp lệ**: Các bước chuyển đổi nhảy cóc (ví dụ: `SUBMITTED → COMPLETED` trực tiếp) là không hợp lệ và phải trả về HTTP `409 Conflict` hoặc `422 Unprocessable Entity`.
- **Ghi nhật ký kiểm toán (Audit Log)**: Mỗi bước chuyển đổi trạng thái phải lưu lại 1 bản ghi trong bảng `application_history` và tạo 1 bản ghi `notifications` tương ứng trong cùng 1 Transaction (`@Transactional`).
