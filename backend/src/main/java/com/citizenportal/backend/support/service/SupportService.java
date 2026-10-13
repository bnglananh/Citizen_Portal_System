package com.citizenportal.backend.support.service;

import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ForbiddenException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.common.util.FileStorageService;
import com.citizenportal.backend.common.util.SecurityUtils;
import com.citizenportal.backend.support.dto.SupportConversationDto;
import com.citizenportal.backend.support.dto.SupportMessageDto;
import com.citizenportal.backend.support.entity.SupportConversation;
import com.citizenportal.backend.support.entity.SupportMessage;
import com.citizenportal.backend.support.entity.SupportStatus;
import com.citizenportal.backend.support.repository.SupportConversationRepository;
import com.citizenportal.backend.support.repository.SupportMessageRepository;
import com.citizenportal.backend.user.entity.RoleType;
import com.citizenportal.backend.user.entity.User;
import com.citizenportal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final JdbcTemplate jdbcTemplate;

    private void ensureSchemaNullable() {
        try {
            jdbcTemplate.execute("ALTER TABLE support_conversations ALTER COLUMN staff_id DROP NOT NULL");
        } catch (Exception e) {
            log.debug("Schema check staff_id: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE support_messages ALTER COLUMN sender_id DROP NOT NULL");
        } catch (Exception e) {
            log.debug("Schema check sender_id: {}", e.getMessage());
        }
    }

    /**
     * Lấy hoặc tạo mới phiên hỗ trợ khẩn cấp cho công dân hiện tại
     * Tự động random 1 cán bộ phụ trách từ danh sách ROLE_STAFF
     */
    @Transactional
    public SupportConversationDto getOrCreateCitizenConversation() {
        ensureSchemaNullable();
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User citizen = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin công dân"));

        // Tìm phiên đang mở (OPEN)
        List<SupportConversation> activeList = conversationRepository.findByCitizenIdAndStatus(citizen.getId(), SupportStatus.OPEN);
        if (!activeList.isEmpty()) {
            SupportConversation conv = activeList.get(0);
            // Nếu phiên cũ lỡ bị gán cho Admin, giải phóng về null để cán bộ tiếp nhận
            if (conv.getStaff() != null && conv.getStaff().getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN)) {
                conv.setStaff(null);
                conversationRepository.save(conv);
            }
            return mapToConversationDto(conv, citizen.getId());
        }

        // Tạo phiên mới chưa gán cán bộ cụ thể (staff = null, ở trạng thái chờ cán bộ tiếp nhận)
        SupportConversation newConv = SupportConversation.builder()
                .citizen(citizen)
                .staff(null)
                .subject("Hỗ trợ khẩn cấp thủ tục hành chính")
                .status(SupportStatus.OPEN)
                .build();
        newConv = conversationRepository.save(newConv);

        // Tạo tin nhắn chào mừng tự động từ hệ thống
        SupportMessage welcomeMsg = SupportMessage.builder()
                .conversation(newConv)
                .sender(null)
                .senderRole("ROLE_STAFF")
                .content("Xin chào bạn! Bạn đang kết nối với Tổ hỗ trợ trực tuyến phường Tân Phú. Vui lòng cho biết bạn đang gặp trục trặc gì để cán bộ trực ban tiếp nhận hỗ trợ.")
                .read(false)
                .build();
        messageRepository.save(welcomeMsg);

        log.info("Khởi tạo phiên hỗ trợ khẩn cấp #{} của công dân {} (đang chờ cán bộ tiếp nhận)",
                newConv.getId(), citizen.getUsername());

        return mapToConversationDto(newConv, citizen.getId());
    }

    /**
     * Lấy danh sách các cuộc trò chuyện của cán bộ hiện tại
     * Trả về các phiên do chính cán bộ này phụ trách HOẶC các phiên đang chờ tiếp nhận
     * (Admin không có quyền truy cập, các phiên đã có cán bộ khác nhận sẽ không hiển thị)
     */
    @Transactional(readOnly = true)
    public List<SupportConversationDto> getStaffConversations() {
        Long currentStaffId = SecurityUtils.getCurrentUserId();
        User staff = userRepository.findById(currentStaffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin cán bộ"));

        boolean isStaff = staff.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_STAFF);
        boolean isAdmin = staff.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
        if (!isStaff || isAdmin) {
            throw new ForbiddenException("Quản trị viên (Admin) không có quyền tham gia trả lời tin nhắn hỗ trợ người dân");
        }

        List<SupportConversation> list = conversationRepository.findAvailableForStaff(currentStaffId);

        return list.stream()
                .map(c -> mapToConversationDto(c, currentStaffId))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tin nhắn của 1 cuộc trò chuyện và đánh dấu đã đọc
     */
    @Transactional
    public List<SupportMessageDto> getConversationMessages(Long conversationId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        SupportConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc trò chuyện #" + conversationId));

        validateAccess(conv, currentUserId);

        // Đánh dấu đã đọc các tin nhắn gửi tới user hiện tại
        messageRepository.markMessagesAsRead(conversationId, currentUserId);

        List<SupportMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
    }

    /**
     * Gửi tin nhắn (hỗ trợ kèm file/ảnh)
     * Khi 1 cán bộ gửi tin nhắn trả lời -> Phiên được gán chính thức cho cán bộ đó, các cán bộ khác không nhận được nữa
     */
    @Transactional
    public SupportMessageDto sendMessage(Long conversationId, String content, MultipartFile file) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        SupportConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc trò chuyện #" + conversationId));

        validateAccess(conv, currentUserId);

        if ((content == null || content.trim().isEmpty()) && (file == null || file.isEmpty())) {
            throw new BadRequestException("Nội dung tin nhắn hoặc tệp đính kèm không được để trống");
        }

        boolean isStaff = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_STAFF);
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
        if (isAdmin) {
            throw new ForbiddenException("Admin không có quyền tham gia trả lời tin nhắn hỗ trợ");
        }

        String senderRole = "ROLE_CITIZEN";
        if (isStaff) {
            senderRole = "ROLE_STAFF";
            // NẾU PHIÊN CHƯA CÓ CÁN BỘ NÀO NHẬN -> CÁN BỘ NÀY TIẾP NHẬN ĐỘC QUYỀN
            if (conv.getStaff() == null) {
                conv.setStaff(currentUser);
                log.info("Cán bộ {} ({}) đã tiếp nhận xử lý phiên hỗ trợ #{} của công dân {}",
                        currentUser.getFullName(), currentUser.getUsername(), conv.getId(), conv.getCitizen().getUsername());
            } else if (!conv.getStaff().getId().equals(currentUserId)) {
                throw new ForbiddenException("Phiên hỗ trợ này đã được cán bộ " + conv.getStaff().getFullName() + " tiếp nhận xử lý");
            }
        }

        String attachmentUrl = null;
        String attachmentName = null;
        String attachmentType = null;

        if (file != null && !file.isEmpty()) {
            attachmentUrl = fileStorageService.storeFile(file, "support");
            attachmentName = file.getOriginalFilename();
            attachmentType = file.getContentType();
        }

        SupportMessage msg = SupportMessage.builder()
                .conversation(conv)
                .sender(currentUser)
                .senderRole(senderRole)
                .content(content != null ? content.trim() : "")
                .attachmentUrl(attachmentUrl)
                .attachmentName(attachmentName)
                .attachmentType(attachmentType)
                .read(false)
                .build();
        msg = messageRepository.save(msg);

        // Cập nhật updatedAt của cuộc trò chuyện
        conv.setUpdatedAt(msg.getCreatedAt());
        conversationRepository.save(conv);

        return mapToMessageDto(msg);
    }

    /**
     * Đóng / Hoàn tất hỗ trợ
     */
    @Transactional
    public void resolveConversation(Long conversationId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        SupportConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc trò chuyện #" + conversationId));

        validateAccess(conv, currentUserId);

        conv.setStatus(SupportStatus.RESOLVED);
        conversationRepository.save(conv);
    }

    private void validateAccess(SupportConversation conv, Long userId) {
        boolean isCitizen = conv.getCitizen().getId().equals(userId);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new ForbiddenException("Không tìm thấy thông tin người dùng");
        }

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
        if (isAdmin) {
            throw new ForbiddenException("Admin không có quyền truy cập hoặc trả lời cuộc trò chuyện hỗ trợ này");
        }

        boolean isStaff = user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.ROLE_STAFF);

        // Nếu phiên đã có cán bộ tiếp nhận: chỉ cán bộ đó hoặc công dân mới có quyền
        if (conv.getStaff() != null) {
            boolean isAssignedStaff = conv.getStaff().getId().equals(userId);
            if (!isCitizen && !isAssignedStaff) {
                throw new ForbiddenException("Phiên hỗ trợ này đã được một cán bộ khác tiếp nhận xử lý");
            }
        } else {
            // Phiên chưa có cán bộ tiếp nhận: công dân hoặc bất kỳ cán bộ trực ban nào đều có thể xem
            if (!isCitizen && !isStaff) {
                throw new ForbiddenException("Bạn không có quyền truy cập cuộc trò chuyện hỗ trợ này");
            }
        }
    }

    private SupportConversationDto mapToConversationDto(SupportConversation conv, Long currentUserId) {
        List<SupportMessage> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
        SupportMessage lastMsg = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);
        int unreadCount = messageRepository.countUnreadMessages(conv.getId(), currentUserId);

        Long staffId = conv.getStaff() != null ? conv.getStaff().getId() : null;
        String staffName = conv.getStaff() != null ? conv.getStaff().getFullName() : "Đang chờ cán bộ tiếp nhận...";
        String staffEmail = conv.getStaff() != null ? conv.getStaff().getEmail() : null;

        return SupportConversationDto.builder()
                .id(conv.getId())
                .citizenId(conv.getCitizen().getId())
                .citizenName(conv.getCitizen().getFullName())
                .citizenPhone(conv.getCitizen().getPhoneNumber())
                .citizenEmail(conv.getCitizen().getEmail())
                .staffId(staffId)
                .staffName(staffName)
                .staffEmail(staffEmail)
                .subject(conv.getSubject())
                .status(conv.getStatus())
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .lastMessage(lastMsg != null ? mapToMessageDto(lastMsg) : null)
                .unreadCount(unreadCount)
                .build();
    }

    private SupportMessageDto mapToMessageDto(SupportMessage msg) {
        Long senderId = msg.getSender() != null ? msg.getSender().getId() : null;
        String senderName = msg.getSender() != null ? msg.getSender().getFullName() : "Tổ hỗ trợ trực tuyến";

        return SupportMessageDto.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(senderId)
                .senderName(senderName)
                .senderRole(msg.getSenderRole())
                .content(msg.getContent())
                .attachmentUrl(msg.getAttachmentUrl())
                .attachmentName(msg.getAttachmentName())
                .attachmentType(msg.getAttachmentType())
                .isRead(msg.isRead())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
