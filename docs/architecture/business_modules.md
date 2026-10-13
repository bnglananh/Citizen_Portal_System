# 📦 DANH SÁCH CÁC MODULE NGHIỆP VỤ (CHI TIẾT)

## Module 1 — Authentication & Account (Xác thực & Người dùng)

- Đăng ký tài khoản công dân, đăng nhập JWT (trả về Access Token có hạn sử dụng và chứa claims role/userId).
- Đổi mật khẩu, xem và chỉnh sửa thông tin hồ sơ cá nhân (họ tên, CCCD/CMND, số điện thoại, địa chỉ thường trú).
- Admin quản lý danh sách người dùng toàn hệ thống, tạo tài khoản Cán bộ / Admin, khóa hoặc mở khóa tài khoản người dùng.
- **Quy tắc bảo mật**: Mật khẩu mã hóa 1 chiều bằng BCrypt; phân quyền chặt chẽ theo Role (`CITIZEN`, `STAFF`, `ADMIN`) kết hợp kiểm tra quyền sở hữu (Ownership validation) tại Service layer.

## Module 2 — Danh mục Lĩnh vực & Thủ tục Hành chính

- Quản lý danh mục lĩnh vực (Tư pháp, Hộ tịch, Đất đai, Xây dựng, Lao động - Thương binh & Xã hội...).
- Quản lý danh mục thủ tục hành chính: Tên thủ tục, mô tả, thời hạn giải quyết (ngày làm việc), mức phí/lệ phí, căn cứ pháp lý, quy trình thực hiện.
- Cấu hình thành phần tài liệu bắt buộc (`is_required = true`) hoặc tùy chọn cho từng thủ tục, kèm đường dẫn file biểu mẫu mẫu để công dân tải về.

## Module 3 — Tra cứu Thủ tục Công & Theo dõi Công khai

- **Cổng công dân**: Danh sách thủ tục phân trang, tìm kiếm tức thì theo từ khóa, lọc theo lĩnh vực.
- **Chi tiết thủ tục**: Trình bày thông tin đa chiều theo 5 tab (Thông tin chung, Thành phần hồ sơ, Trình tự thực hiện, Phí & Thời hạn, Biểu mẫu đính kèm).
- **Tra cứu hồ sơ công khai (`/tracking`)**: Cho phép người dân tra cứu tiến độ xử lý hồ sơ thông qua Mã hồ sơ (`HS{yyyy}{sequence}`) mà không bắt buộc phải đăng nhập.

## Module 4 — Quản lý Hồ sơ Trực tuyến (Citizen Application Life Cycle)

- **Tạo & Lưu nháp (`DRAFT`)**: Khởi tạo hồ sơ, tự động điền sẵn thông tin công dân từ tài khoản, tải lên các giấy tờ đính kèm (PDF, Word, Ảnh).
- **Nộp hồ sơ (`SUBMITTED`)**: Gửi hồ sơ lên hệ thống, tự động sinh mã hồ sơ duy nhất, chuyển trạng thái và gửi thông báo tới cán bộ.
- **Theo dõi tiến trình**: Giao diện trực quan dạng Timeline & Steps thể hiện chi tiết từng bước xử lý.
- **Bổ sung hồ sơ (`NEED_REVISION` ➔ `RESUBMITTED`)**: Khi cán bộ yêu cầu sửa đổi, công dân nhận được lý do chi tiết và form cho phép thay thế/bổ sung giấy tờ rồi nộp lại.

## Module 5 — Xử lý Hồ sơ Hành chính (Staff Processing)

- **Bàn làm việc Cán bộ (Staff Workstation)**: Danh sách hồ sơ phân loại theo trạng thái (Chờ tiếp nhận, Đang xử lý, Cần bổ sung, Đã hoàn tất, Đã từ chối).
- **Tiếp nhận hồ sơ (`IN_PROGRESS`)**: Cán bộ kiểm tra tính hợp lệ ban đầu của hồ sơ và chuyển sang giai đoạn thụ lý.
- **Yêu cầu bổ sung (`NEED_REVISION`)**: Bắt buộc nhập rõ nội dung cần sửa đổi/bổ sung để người dân thực hiện.
- **Từ chối giải quyết (`REJECTED`)**: Bắt buộc nhập lý do từ chối và căn cứ pháp lý.
- **Phê duyệt & Hoàn tất (`COMPLETED`)**: Xác nhận hoàn tất thủ tục, cho phép đính kèm file kết quả/giấy tờ bản điện tử gửi cho người dân.

## Module 6 — Nhật ký Xử lý Hồ sơ (Audit Log / Application History)

- Bảng nhật ký `application_history` thiết kế dạng **Append-only** (nghiêm cấm thao tác UPDATE / DELETE).
- Tự động ghi lại từng lần thay đổi trạng thái: Người thao tác (Cán bộ / Công dân), trạng thái trước và sau, ghi chú / lý do, dấu thời gian thực tế (`created_at`).
- Cung cấp dữ liệu minh bạch phục vụ hiển thị Timeline cho cả công dân, cán bộ và quản trị viên.

## Module 7 — Hệ thống Thông báo (In-App Notification)

- Tự động sinh thông báo tại các mốc sự kiện quan trọng trong vòng đời hồ sơ: Nộp hồ sơ, tiếp nhận, yêu cầu bổ sung, nộp lại, từ chối, phê duyệt hoàn tất.
- Hiển thị biểu tượng chuông trên thanh điều hướng với số đếm thông báo chưa đọc (Badge), hỗ trợ xem danh sách, đánh dấu từng thông báo hoặc toàn bộ là đã đọc, nhấp vào thông báo để chuyển hướng ngay tới hồ sơ tương ứng.

## Module 8 — Báo cáo & Thống kê Dashboard

- **Citizen Dashboard**: Thống kê số lượng hồ sơ cá nhân theo từng nhóm trạng thái, thao tác nhanh để nộp hồ sơ mới hoặc xem lại hồ sơ gần nhất.
- **Staff Dashboard**: Thống kê khối lượng công việc, số hồ sơ chờ tiếp nhận, số hồ sơ đang thụ lý, cảnh báo hồ sơ quá hạn.
- **Admin Dashboard**: Thống kê tổng quan toàn hệ thống (Tổng tài khoản, tổng thủ tục, tổng hồ sơ), biểu đồ tròn phân bổ trạng thái hồ sơ, biểu đồ cột xu hướng nộp hồ sơ theo tháng, thời gian xử lý trung bình của từng đơn vị.

## Module 9 — Trợ lý Ảo AI & Bộ Hỏi Đáp FAQ (Gemini 2.0 Flash Lite & Persona)

- **Mô hình AI**: Sử dụng Google Gemini 2.0 Flash Lite qua Backend Spring Boot, tối ưu thời gian phản hồi (low latency).
- **Tích hợp ngữ cảnh (RAG nhẹ)**: Backend tự động tổng hợp danh mục thủ tục, bộ câu hỏi FAQ và dữ liệu hồ sơ cá nhân thuộc quyền sở hữu của user gửi kèm prompt cho Gemini.
- **Tùy biến phong cách xưng hô (Chatbot Persona)**: Admin có thể tùy chọn phong cách phản hồi của AI (*Trợ lý dịch vụ công, Thân thiện gần gũi, Ban quản trị trang trọng*), AI tự động thay đổi ngôi xưng (Tôi/Bạn, Chúng tôi/Người dân, Cổng DVC/Quý công dân).
- **Cơ chế Fallback nội bộ**: Nếu xảy ra lỗi kết nối internet hoặc API Google, hệ thống tự động chuyển sang Rule-based engine nội bộ để giải đáp tức thì mà không gián đoạn người dùng.
- **Cổng FAQ công khai & Quản trị FAQ**: Cung cấp giao diện tra cứu câu hỏi thường gặp cho công dân (`/faq`) và màn hình CRUD quản lý câu hỏi cho Admin (`/admin/faqs`).

## Module 10 — Quản trị Hệ thống Toàn diện (Admin Management)

- Quản lý phân quyền tài khoản (User, Staff, Admin).
- Quản trị toàn bộ danh mục lĩnh vực và thủ tục hành chính.
- Quản lý kho câu hỏi thường gặp FAQ.
- Quản trị cấu hình xưng hô và tham số Trợ lý AI.
- Giám sát dashboard hoạt động và hiệu suất xử lý hồ sơ của toàn bộ phường/xã.

## Module 11 — Kênh Hỗ Trợ Khẩn Cấp Trực Tiếp Cán Bộ - Công Dân (Live Support Chat)

- **Mục đích nghiệp vụ**: Cung cấp kênh trao đổi trực tiếp, tức thời khi người dân gặp vướng mắc, sự cố đột xuất hoặc vướng mắc kỹ thuật trong quá trình nộp hồ sơ, đóng vai trò giải quyết sự vụ khẩn cấp song song với Trợ lý ảo AI.
- **Cơ chế phân bổ cán bộ (Exclusive Random Assignment)**:
  - Khi người dân mở cửa sổ chat hỗ trợ, nếu chưa có phiên nào đang mở (`OPEN`), hệ thống tự động chọn ngẫu nhiên một Cán bộ phụ trách (`ROLE_STAFF`) có sẵn trong hệ thống và khởi tạo phiên kết nối.
  - Sau khi phiên đã được tiếp nhận và gán cho một cán bộ cụ thể, **chỉ duy nhất cán bộ đó (`ROLE_STAFF`)** mới nhìn thấy cuộc hội thoại này trên danh sách của mình; Admin và các cán bộ khác hoàn toàn không có quyền xem hay trả lời tin nhắn hỗ trợ.
- **Trao đổi đa phương tiện (File & Image Upload)**:
  - Cho phép người dân và cán bộ gửi tin nhắn văn bản kèm hình ảnh chụp lỗi màn hình (JPG, PNG) hoặc tài liệu mẫu / hướng dẫn (PDF, Word, Zip).
  - Tệp được kiểm tra định dạng, giới hạn dung lượng và lưu trữ bảo mật qua hệ thống lưu trữ tệp backend.
- **Giao diện & Tiện ích người dùng**:
  - **Công dân**: Nút Floating Action Button (FAB) màu cam-đỏ nổi bật góc dưới màn hình, tích hợp cửa sổ chat thu gọn tiện lợi, tự động đồng bộ tin nhắn qua cơ chế polling.
  - **Cán bộ (`ROLE_STAFF`)**: Mục điều hướng riêng trên Sidebar ("Tin nhắn hỗ trợ (Khẩn cấp)") dẫn tới Workspace hỗ trợ chuyên biệt: danh sách người dân đang phụ trách bên trái và khung chat trực tiếp 2 chiều kèm nút "Hoàn tất hỗ trợ" bên phải. Role Admin không hiển thị menu này.


