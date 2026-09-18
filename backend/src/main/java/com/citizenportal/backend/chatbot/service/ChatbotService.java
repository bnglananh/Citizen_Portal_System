package com.citizenportal.backend.chatbot.service;

import com.citizenportal.backend.application.entity.Application;
import com.citizenportal.backend.application.repository.ApplicationRepository;
import com.citizenportal.backend.chatbot.client.GeminiClient;
import com.citizenportal.backend.chatbot.dto.*;
import com.citizenportal.backend.chatbot.entity.ChatConversation;
import com.citizenportal.backend.chatbot.entity.ChatMessage;
import com.citizenportal.backend.chatbot.entity.ChatbotSetting;
import com.citizenportal.backend.chatbot.repository.ChatConversationRepository;
import com.citizenportal.backend.chatbot.repository.ChatMessageRepository;
import com.citizenportal.backend.chatbot.repository.ChatbotSettingRepository;
import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.faq.entity.Faq;
import com.citizenportal.backend.faq.repository.FaqRepository;
import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import com.citizenportal.backend.procedure.repository.ProcedureRepository;
import com.citizenportal.backend.user.entity.User;
import com.citizenportal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    public static final String SETTING_PERSONA_TONE = "PERSONA_TONE";
    public static final String TONE_CITIZEN_ASSISTANT = "CITIZEN_ASSISTANT";
    public static final String TONE_FRIENDLY = "FRIENDLY";
    public static final String TONE_OFFICIAL_COLLECTIVE = "OFFICIAL_COLLECTIVE";

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatbotSettingRepository settingRepository;
    private final ProcedureRepository procedureRepository;
    private final FaqRepository faqRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final GeminiClient geminiClient;

    /**
     * Gửi tin nhắn và nhận phản hồi từ Trợ lý AI (Gemini hoặc Fallback Engine)
     */
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        User currentUser = getCurrentUserOptional().orElse(null);
        String toneKey = getActivePersonaKey();

        // 1. Lấy hoặc tạo mới cuộc trò chuyện
        ChatConversation conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseGet(() -> createNewConversation(currentUser, request.getMessage()));
        } else {
            conversation = createNewConversation(currentUser, request.getMessage());
        }

        // 2. Lưu tin nhắn USER
        ChatMessage userMsg = ChatMessage.builder()
                .conversation(conversation)
                .senderType("USER")
                .content(request.getMessage())
                .build();
        messageRepository.save(userMsg);

        // 3. Xây dựng Context & System Prompt với bối cảnh xưng hô đã chọn
        String systemInstruction = buildSystemInstruction(currentUser, toneKey);

        // 4. Lấy lịch sử hội thoại gần nhất (tối đa 6 tin gần nhất)
        List<ChatMessage> recentMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Map<String, String>> historyList = recentMessages.stream()
                .limit(6)
                .map(m -> Map.of(
                        "senderType", m.getSenderType(),
                        "content", m.getContent()
                ))
                .collect(Collectors.toList());

        // 5. Gọi Gemini API
        String aiReply = geminiClient.generateContent(systemInstruction, request.getMessage(), historyList);

        // 6. Nếu Gemini không khả dụng, sử dụng Fallback Engine với bối cảnh xưng hô tương ứng
        if (!StringUtils.hasText(aiReply)) {
            aiReply = fallbackEngine(request.getMessage(), currentUser, toneKey);
        }

        // Thêm disclaimer ở cuối
        aiReply = aiReply.trim() + "\n\n*(💡 Lưu ý: Thông tin do Trợ lý AI cung cấp mang tính chất hướng dẫn, tham khảo theo quy định hiện hành.)*";

        // 7. Lưu tin nhắn AI vào CSDL
        ChatMessage aiMsg = ChatMessage.builder()
                .conversation(conversation)
                .senderType("AI")
                .content(aiReply)
                .build();
        ChatMessage savedAiMsg = messageRepository.save(aiMsg);

        return ChatMessageResponse.builder()
                .id(savedAiMsg.getId())
                .conversationId(conversation.getId())
                .senderType("AI")
                .content(savedAiMsg.getContent())
                .createdAt(savedAiMsg.getCreatedAt())
                .build();
    }

    /**
     * Lấy lịch sử chi tiết của một cuộc hội thoại
     */
    @Transactional(readOnly = true)
    public ChatConversationDto getConversationHistory(Long conversationId) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội thoại với ID: " + conversationId));

        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<ChatMessageResponse> messageDtos = messages.stream()
                .map(m -> ChatMessageResponse.builder()
                        .id(m.getId())
                        .conversationId(conversationId)
                        .senderType(m.getSenderType())
                        .content(m.getContent())
                        .referencedProcedureId(m.getReferencedProcedureId())
                        .referencedApplicationId(m.getReferencedApplicationId())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ChatConversationDto.builder()
                .id(conversation.getId())
                .userId(conversation.getUser() != null ? conversation.getUser().getId() : null)
                .title(conversation.getTitle())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .messages(messageDtos)
                .build();
    }

    /**
     * Lấy danh sách câu hỏi gợi ý nhanh (Quick Prompts)
     */
    public List<QuickPromptDto> getQuickPrompts() {
        return List.of(
                QuickPromptDto.builder()
                        .label("Đăng ký khai sinh")
                        .prompt("Tôi muốn đăng ký khai sinh cho con thì cần chuẩn bị giấy tờ gì và thời gian xử lý bao lâu?")
                        .category("Hộ tịch")
                        .build(),
                QuickPromptDto.builder()
                        .label("Đăng ký kết hôn")
                        .prompt("Quy trình và hồ sơ cần nộp khi đăng ký kết hôn trực tuyến gồm những gì?")
                        .category("Hộ tịch")
                        .build(),
                QuickPromptDto.builder()
                        .label("Cấp lại thẻ BHYT")
                        .prompt("Hướng dẫn tôi nộp hồ sơ xin cấp lại thẻ BHYT do bị hỏng hoặc mất.")
                        .category("Bảo trợ xã hội")
                        .build(),
                QuickPromptDto.builder()
                        .label("Tra cứu hồ sơ của tôi")
                        .prompt("Hồ sơ thủ tục của tôi hiện tại đang ở trạng thái nào và tiến độ xử lý ra sao?")
                        .category("Hồ sơ cá nhân")
                        .build(),
                QuickPromptDto.builder()
                        .label("Thời gian làm việc")
                        .prompt("Bộ phận Tiếp nhận và Trả kết quả làm việc vào những khung giờ nào?")
                        .category("Hỏi đáp chung")
                        .build()
        );
    }

    /**
     * Lấy cấu hình Persona xưng hô hiện tại (Dành cho Admin)
     */
    @Transactional(readOnly = true)
    public ChatbotPersonaDto getPersonaSettings() {
        String activeKey = getActivePersonaKey();
        return buildPersonaDto(activeKey);
    }

    /**
     * Lấy cấu hình Persona public (Dành cho Chatbot Widget)
     */
    @Transactional(readOnly = true)
    public ChatbotPersonaDto getPublicPersona() {
        String activeKey = getActivePersonaKey();
        return buildPersonaDto(activeKey);
    }

    /**
     * Cập nhật cấu hình Persona xưng hô (Dành cho Admin)
     */
    @Transactional
    public ChatbotPersonaDto updatePersona(UpdatePersonaRequest request) {
        String newKey = request.getToneKey().trim().toUpperCase();
        if (!List.of(TONE_CITIZEN_ASSISTANT, TONE_FRIENDLY, TONE_OFFICIAL_COLLECTIVE).contains(newKey)) {
            throw new BadRequestException("Mã phong cách xưng hô không hợp lệ: " + newKey);
        }

        ChatbotSetting setting = settingRepository.findBySettingKey(SETTING_PERSONA_TONE)
                .orElse(ChatbotSetting.builder()
                        .settingKey(SETTING_PERSONA_TONE)
                        .description("Phong cách bối cảnh xưng hô của Trợ lý AI")
                        .build());

        setting.setSettingValue(newKey);
        settingRepository.save(setting);

        log.info("Admin updated Chatbot Persona tone to: {}", newKey);
        return buildPersonaDto(newKey);
    }

    /**
     * Xóa một cuộc hội thoại
     */
    @Transactional
    public void deleteConversation(Long conversationId) {
        if (conversationRepository.existsById(conversationId)) {
            conversationRepository.deleteById(conversationId);
        }
    }

    // ==========================================
    // PRIVATE HELPER METHODS
    // ==========================================

    public String getActivePersonaKey() {
        return settingRepository.findBySettingKey(SETTING_PERSONA_TONE)
                .map(ChatbotSetting::getSettingValue)
                .filter(StringUtils::hasText)
                .orElse(TONE_CITIZEN_ASSISTANT);
    }

    private ChatConversation createNewConversation(User currentUser, String firstMessage) {
        String title = firstMessage.length() > 50 ? firstMessage.substring(0, 47) + "..." : firstMessage;
        ChatConversation conversation = ChatConversation.builder()
                .user(currentUser)
                .title(title)
                .build();
        return conversationRepository.save(conversation);
    }

    private String buildSystemInstruction(User currentUser, String toneKey) {
        StringBuilder sb = new StringBuilder();

        // 1. Quy tắc Xưng hô theo Persona Tone
        switch (toneKey) {
            case TONE_FRIENDLY -> {
                sb.append("Bạn là 'Trợ lý ảo Dịch vụ công', hỗ trợ giải đáp thắc mắc về thủ tục hành chính trực tuyến.\n");
                sb.append("QUY TẮC XƯNG HÔ BẮT BUỘC: Bạn xưng là 'Tôi', và luôn gọi người dùng là 'Bạn' (hoặc 'Bạn ' + Họ tên nếu người dùng đã đăng nhập). Giữ phong cách thân thiện, gần gũi, tự nhiên, dễ hiểu, ngắn gọn và nhiệt tình.\n\n");
            }
            case TONE_OFFICIAL_COLLECTIVE -> {
                sb.append("Bạn là đại diện 'Ban biên tập Cổng Dịch vụ công Cấp Phường/Xã', hỗ trợ giải đáp quy trình thủ tục hành chính trực tuyến.\n");
                sb.append("QUY TẮC XƯNG HÔ BẮT BUỘC: Bạn xưng là 'Chúng tôi' (hoặc 'Cổng Dịch vụ công chúng tôi'), và luôn gọi người dùng là 'Người dùng' hoặc 'Quý khách'. Giữ phong cách cơ quan hành chính tập thể, chuẩn mực, nghiêm túc, thông tin chính xác theo quy định.\n\n");
            }
            default -> { // CITIZEN_ASSISTANT
                sb.append("Bạn là 'Trợ lý ảo Dịch vụ công Cấp Phường/Xã', hỗ trợ người dân và cán bộ giải đáp các thắc mắc về thủ tục hành chính trực tuyến.\n");
                sb.append("QUY TẮC XƯNG HÔ BẮT BUỘC: Bạn xưng là 'Tôi' hoặc 'Trợ lý ảo', và luôn gọi người dùng/công dân là 'Quý công dân' (hoặc 'Quý công dân ' + Họ tên nếu đã đăng nhập). Giữ phong cách trang trọng, lịch sự, ân cần, chuẩn mực hành chính công nhà nước.\n\n");
            }
        }

        // 2. Nạp danh sách thủ tục
        sb.append("--- DANH MỤC THỦ TỤC HÀNH CHÍNH HIỆN HÀNH TẠI CỔNG DVC ---\n");
        List<Procedure> procedures = procedureRepository.findByActiveTrue(Pageable.unpaged()).getContent();
        for (Procedure p : procedures) {
            sb.append(String.format("- Mã TT: %s | Tên: %s | Thời gian giải quyết: %d ngày | Lệ phí: %s\n",
                    p.getCode(), p.getName(), p.getProcessingDurationDays(),
                    p.getFee() != null && p.getFee().doubleValue() > 0 ? p.getFee().toPlainString() + " VNĐ" : "Miễn phí"));
            if (p.getRequiredDocuments() != null && !p.getRequiredDocuments().isEmpty()) {
                sb.append("  + Giấy tờ: ");
                String docs = p.getRequiredDocuments().stream()
                        .map(ProcedureRequiredDocument::getDocumentName)
                        .collect(Collectors.joining(", "));
                sb.append(docs).append("\n");
            }
        }

        // 3. Nạp câu hỏi FAQ
        sb.append("\n--- CÂU HỎI THƯỜNG GẶP (FAQs) ---\n");
        List<Faq> faqs = faqRepository.findByActiveTrueOrderByOrderIndexAsc();
        for (Faq f : faqs) {
            sb.append(String.format("Q: %s\nA: %s\n\n", f.getQuestion(), f.getAnswer()));
        }

        // 4. Nạp thông tin hồ sơ của người dùng (nếu đã đăng nhập)
        if (currentUser != null) {
            sb.append(String.format("\n--- THÔNG TIN CÔNG DÂN ĐANG ĐĂNG NHẬP (Họ tên: %s, CCCD: %s) ---\n",
                    currentUser.getFullName(), currentUser.getIdentityCardNumber() != null ? currentUser.getIdentityCardNumber() : ""));
            List<Application> myApps = applicationRepository.findByCitizenId(currentUser.getId(), PageRequest.of(0, 5)).getContent();
            if (!myApps.isEmpty()) {
                sb.append("Danh sách hồ sơ gần đây của người dùng:\n");
                for (Application a : myApps) {
                    String note = a.getRevisionNotes() != null ? a.getRevisionNotes() :
                            (a.getRejectionReason() != null ? a.getRejectionReason() :
                                    (a.getResultSummary() != null ? a.getResultSummary() : "Đang xử lý"));
                    sb.append(String.format("- Mã hồ sơ: %s | Thủ tục: %s | Trạng thái: %s | Ghi chú: %s | Ngày nộp: %s\n",
                            a.getApplicationCode(), a.getProcedure().getName(), a.getStatus().getDisplayName(),
                            note, a.getCreatedAt()));
                }
            } else {
                sb.append("Hiện tại chưa nộp hồ sơ nào trên hệ thống.\n");
            }
        }

        sb.append("\nNhiệm vụ của bạn: Hướng dẫn người dân dựa trên các thông tin chính thống ở trên, tuân thủ đúng phong cách xưng hô được chỉ định. Nếu câu hỏi liên quan đến hồ sơ cá nhân của người dùng, hãy đối chiếu với danh sách hồ sơ ở trên để trả lời chính xác.");
        return sb.toString();
    }

    /**
     * Fallback Engine khi không kết nối được Gemini API
     */
    private String fallbackEngine(String question, User currentUser, String toneKey) {
        String lowerQ = question.toLowerCase();

        // Từ xưng hô theo Persona
        String userTitle = switch (toneKey) {
            case TONE_FRIENDLY -> currentUser != null ? "bạn **" + currentUser.getFullName() + "**" : "bạn";
            case TONE_OFFICIAL_COLLECTIVE -> currentUser != null ? "Người dùng **" + currentUser.getFullName() + "**" : "Người dùng";
            default -> currentUser != null ? "Quý công dân **" + currentUser.getFullName() + "**" : "Quý công dân";
        };

        String botSelf = switch (toneKey) {
            case TONE_FRIENDLY -> "Tôi";
            case TONE_OFFICIAL_COLLECTIVE -> "Chúng tôi";
            default -> "Tôi";
        };

        // 1. Tra cứu theo Mã hồ sơ cụ thể (VD: HS2026xxxx hoặc chứa HS...)
        if (lowerQ.matches(".*hs[0-9]{4,}.*") || lowerQ.contains("mã hồ sơ")) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(?i)(HS[0-9]{4,}[A-Za-z0-9]*)").matcher(question);
            if (matcher.find()) {
                String appCode = matcher.group(1).toUpperCase();
                Optional<Application> appOpt = applicationRepository.findByApplicationCode(appCode);
                if (appOpt.isPresent()) {
                    Application a = appOpt.get();
                    String note = a.getRevisionNotes() != null ? a.getRevisionNotes() :
                            (a.getRejectionReason() != null ? a.getRejectionReason() :
                                    (a.getResultSummary() != null ? a.getResultSummary() : "Hồ sơ đang trong quy trình xử lý chuyên môn."));
                    StringBuilder sb = new StringBuilder();
                    sb.append(String.format("### 🔍 Kết quả tra cứu hồ sơ: `%s`\n\n", a.getApplicationCode()));
                    sb.append(String.format("- **Thủ tục:** %s\n", a.getProcedure().getName()));
                    sb.append(String.format("- **Người nộp:** %s\n", a.getCitizen().getFullName()));
                    sb.append(String.format("- **Trạng thái hiện tại:** %s\n", a.getStatus().getDisplayName()));
                    sb.append(String.format("- **Ngày nộp:** %s\n", a.getCreatedAt()));
                    sb.append(String.format("- **Ghi chú/Phản hồi:** %s\n\n", note));
                    sb.append(String.format("👉 %s có thể xem chi tiết tiến độ tại [Tra cứu công khai](/tracking?code=%s).",
                            StringUtils.capitalize(userTitle), a.getApplicationCode()));
                    return sb.toString();
                } else {
                    return String.format("Hệ thống không tìm thấy hồ sơ nào có mã `%s`. Vui lòng kiểm tra lại mã số hoặc xem lại giấy hẹn tiếp nhận.", appCode);
                }
            }
        }

        // 2. Tra cứu hồ sơ cá nhân
        if (lowerQ.contains("hồ sơ của tôi") || lowerQ.contains("tiến độ hồ sơ") || lowerQ.contains("trạng thái hồ sơ") || lowerQ.contains("danh sách hồ sơ")) {
            if (currentUser == null) {
                return String.format("Để tra cứu thông tin hồ sơ cá nhân, %s vui lòng **Đăng nhập** vào hệ thống hoặc sử dụng chức năng [Tra cứu công khai](/tracking) bằng Mã hồ sơ (VD: HS2026xxxxxx).", userTitle);
            }
            List<Application> myApps = applicationRepository.findByCitizenId(currentUser.getId(), PageRequest.of(0, 5)).getContent();
            if (myApps.isEmpty()) {
                return String.format("Chào %s, hiện tại bạn chưa có hồ sơ nào trên hệ thống. %s có thể vào mục [Dịch vụ công](/procedures) để đăng ký nộp hồ sơ mới.",
                        userTitle, StringUtils.capitalize(userTitle));
            }
            StringBuilder sb = new StringBuilder();
            sb.append(String.format("Chào %s, %s xin thông báo tình trạng các hồ sơ gần nhất của %s:\n\n", userTitle, botSelf, userTitle));
            for (Application a : myApps) {
                String note = a.getRevisionNotes() != null ? a.getRevisionNotes() :
                        (a.getRejectionReason() != null ? a.getRejectionReason() :
                                (a.getResultSummary() != null ? a.getResultSummary() : "Hồ sơ đang được bộ phận chuyên môn xử lý."));
                sb.append(String.format("📄 **Mã hồ sơ:** `%s`\n- **Thủ tục:** %s\n- **Trạng thái:** %s\n- **Ghi chú/Phản hồi:** %s\n\n",
                        a.getApplicationCode(), a.getProcedure().getName(), a.getStatus().getDisplayName(), note));
            }
            return sb.toString();
        }

        // 3. Thời gian làm việc, địa chỉ, liên hệ
        if (lowerQ.contains("thời gian làm việc") || lowerQ.contains("giờ làm việc") || lowerQ.contains("khung giờ") ||
                lowerQ.contains("mấy giờ") || lowerQ.contains("địa chỉ") || lowerQ.contains("liên hệ") || lowerQ.contains("lịch tiếp")) {
            return "### ⏰ Thời gian làm việc & Liên hệ Bộ phận Tiếp nhận & Trả kết quả\n\n" +
                    "- **Lịch làm việc:** Thứ Hai đến Thứ Sáu (và sáng Thứ Bảy)\n" +
                    "  • **Buổi sáng:** 07:30 - 11:30\n" +
                    "  • **Buổi chiều:** 13:30 - 17:00 (Nghỉ chiều Thứ Bảy, Chủ Nhật và các ngày Lễ/Tết)\n" +
                    "- **Địa điểm:** Bộ phận Tiếp nhận & Trả kết quả - UBND Phường Tân Phú, TP. Hồ Chí Minh\n" +
                    "- **Tổng đài hỗ trợ:** `1900 1234` hoặc `(028) 3829 1234`\n" +
                    "- **Cổng nộp hồ sơ trực tuyến 24/7:** Quý công dân có thể nộp hồ sơ trực tuyến bất kỳ lúc nào tại mục [Dịch vụ công](/procedures).";
        }

        // 4. Tìm kiếm thông minh theo thủ tục (Score-based Matching)
        List<Procedure> procedures = procedureRepository.findByActiveTrue(Pageable.unpaged()).getContent();
        Procedure bestMatch = null;
        int maxScore = 0;

        for (Procedure p : procedures) {
            String pName = p.getName().toLowerCase();
            String pCode = p.getCode().toLowerCase();
            String pDesc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";
            int score = 0;

            if (lowerQ.contains(pCode)) score += 10;
            if (pName.equals(lowerQ)) score += 10;
            if (lowerQ.contains("khai sinh") && (pName.contains("khai sinh") || pDesc.contains("khai sinh"))) score += 5;
            if ((lowerQ.contains("kết hôn") || lowerQ.contains("hôn nhân") || lowerQ.contains("độc thân")) &&
                    (pName.contains("hôn nhân") || pName.contains("kết hôn") || pDesc.contains("kết hôn") || pDesc.contains("hôn nhân"))) score += 5;
            if ((lowerQ.contains("xây dựng") || lowerQ.contains("nhà ở") || lowerQ.contains("cải tạo") || lowerQ.contains("giấy phép xây")) &&
                    (pName.contains("xây dựng") || pDesc.contains("xây dựng"))) score += 5;
            if ((lowerQ.contains("bhyt") || lowerQ.contains("bảo hiểm")) &&
                    (pName.contains("bhyt") || pDesc.contains("bảo hiểm"))) score += 5;
            if ((lowerQ.contains("chứng thực") || lowerQ.contains("sao y") || lowerQ.contains("công chứng")) &&
                    (pName.contains("chứng thực") || pDesc.contains("chứng thực"))) score += 5;
            if (lowerQ.contains("khai tử") && (pName.contains("khai tử") || pDesc.contains("khai tử"))) score += 5;
            if ((lowerQ.contains("đất đai") || lowerQ.contains("sổ đỏ") || lowerQ.contains("quyền sử dụng đất")) &&
                    (pName.contains("đất") || pDesc.contains("đất"))) score += 5;

            String[] tokens = lowerQ.split("\\s+");
            for (String t : tokens) {
                if (t.length() >= 3) {
                    if (pName.contains(t)) score += 1;
                    if (pDesc.contains(t)) score += 1;
                }
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = p;
            }
        }

        if (bestMatch != null && maxScore >= 2) {
            Procedure p = bestMatch;
            StringBuilder sb = new StringBuilder();
            sb.append(String.format("### 📋 Hướng dẫn thủ tục: **%s**\n\n", p.getName()));
            sb.append(String.format("- **Mã thủ tục:** `%s`\n", p.getCode()));
            sb.append(String.format("- **Lĩnh vực:** %s\n", p.getCategory() != null ? p.getCategory().getName() : "Hành chính"));
            sb.append(String.format("- **Thời gian giải quyết:** %d ngày làm việc\n", p.getProcessingDurationDays()));
            sb.append(String.format("- **Lệ phí:** %s\n", p.getFee() != null && p.getFee().doubleValue() > 0 ? p.getFee().toPlainString() + " VNĐ" : "Miễn phí"));
            sb.append(String.format("- **Hình thức tiếp nhận:** %s\n\n", p.getSubmissionMethod() != null ? p.getSubmissionMethod() : "Trực tuyến & Trực tiếp"));

            if (p.getRequiredDocuments() != null && !p.getRequiredDocuments().isEmpty()) {
                sb.append("**📑 Hồ sơ, giấy tờ cần chuẩn bị:**\n");
                for (ProcedureRequiredDocument doc : p.getRequiredDocuments()) {
                    sb.append(String.format("- %s %s\n", doc.getDocumentName(), doc.isRequired() ? "*(Bắt buộc)*" : "*(Nếu có)*"));
                }
            }
            sb.append(String.format("\n👉 %s có thể nhấn vào [Đăng ký nộp hồ sơ](/citizen/submit-application/%d) để nộp trực tuyến ngay.",
                    StringUtils.capitalize(userTitle), p.getId()));
            return sb.toString();
        }

        // 5. Tìm kiếm trong FAQs
        List<Faq> faqs = faqRepository.findByActiveTrueOrderByOrderIndexAsc();
        for (Faq f : faqs) {
            String q = f.getQuestion().toLowerCase();
            if (lowerQ.contains(q.substring(0, Math.min(10, q.length()))) ||
                    (lowerQ.contains("bổ sung") && q.contains("bổ sung")) ||
                    (lowerQ.contains("hẹn trả") && q.contains("hẹn")) ||
                    (lowerQ.contains("tra cứu") && q.contains("tra cứu"))) {
                return String.format("### 💡 %s\n\n%s", f.getQuestion(), f.getAnswer());
            }
        }

        // 6. Trả lời mặc định
        return switch (toneKey) {
            case TONE_FRIENDLY ->
                    "Chào bạn! Tôi là **Trợ lý ảo Dịch vụ công Cấp Phường/Xã**.\n\n" +
                            "Tôi có thể hỗ trợ bạn:\n" +
                            "1. 📝 Hướng dẫn thành phần hồ sơ và quy trình các thủ tục: *Khai sinh, Kết hôn, Cấp lại thẻ BHYT,...\n" +
                            "2. 🔍 Tra cứu trạng thái và tiến độ xử lý hồ sơ.\n" +
                            "3. ⏰ Thông tin về thời gian giải quyết, giờ làm việc và lệ phí.\n\n" +
                            "Vui lòng nhập câu hỏi hoặc chọn các câu hỏi gợi ý bên dưới để tôi hỗ trợ bạn nhé!";
            case TONE_OFFICIAL_COLLECTIVE ->
                    "Kính chào Người dùng! Cổng Dịch vụ công Cấp Phường/Xã chúng tôi sẵn sàng giải đáp thắc mắc của bạn.\n\n" +
                            "Chúng tôi có thể hỗ trợ:\n" +
                            "1. 📝 Hướng dẫn quy định hồ sơ và thủ tục hành chính công trực tuyến.\n" +
                            "2. 🔍 Tra cứu tiến độ giải quyết hồ sơ.\n" +
                            "3. ⏰ Thông tin về giờ làm việc và biểu mức lệ phí niêm yết.\n\n" +
                            "Vui lòng gửi câu hỏi để nhận được hướng dẫn chi tiết từ chúng tôi.";
            default ->
                    "Kính chào Quý công dân! Tôi là **Trợ lý ảo Dịch vụ công Cấp Phường/Xã**.\n\n" +
                            "Tôi có thể hỗ trợ Quý công dân:\n" +
                            "1. 📝 Hướng dẫn thành phần hồ sơ và quy trình thực hiện các thủ tục hành chính trực tuyến.\n" +
                            "2. 🔍 Tra cứu trạng thái và tiến độ xử lý hồ sơ của Quý công dân.\n" +
                            "3. ⏰ Thông tin về thời gian giải quyết, giờ làm việc và mức lệ phí niêm yết.\n\n" +
                            "Vui lòng nhập câu hỏi hoặc chọn các câu hỏi gợi ý bên dưới để được hướng dẫn chi tiết!";
        };
    }

    private ChatbotPersonaDto buildPersonaDto(String activeKey) {
        List<ChatbotPersonaDto.PersonaOptionDto> options = List.of(
                ChatbotPersonaDto.PersonaOptionDto.builder()
                        .key(TONE_CITIZEN_ASSISTANT)
                        .name("Quý công dân - Trợ lý ảo (Tôi)")
                        .botPronoun("Tôi / Trợ lý ảo")
                        .userPronoun("Quý công dân")
                        .description("Chuẩn mực hành chính công nhà nước: Lịch sự, trang trọng, ân cần, cá nhân hóa theo họ tên công dân.")
                        .sampleGreeting("Kính chào Quý công dân! Tôi là Trợ lý ảo Dịch vụ công Cấp Phường/Xã, hân hạnh hỗ trợ Quý công dân.")
                        .sampleResponse("Dạ thưa Quý công dân, để thực hiện thủ tục này, Quý công dân vui lòng chuẩn bị các giấy tờ sau...")
                        .build(),
                ChatbotPersonaDto.PersonaOptionDto.builder()
                        .key(TONE_FRIENDLY)
                        .name("Bạn - Tôi")
                        .botPronoun("Tôi")
                        .userPronoun("Bạn")
                        .description("Thân thiện, gần gũi: Hiện đại, ngắn gọn, tự nhiên và dễ hiểu.")
                        .sampleGreeting("Chào bạn! Tôi là Trợ lý ảo Dịch vụ công, tôi có thể hỗ trợ gì cho bạn hôm nay?")
                        .sampleResponse("Chào bạn, về thủ tục này bạn chỉ cần chuẩn bị 3 loại giấy tờ đơn giản sau...")
                        .build(),
                ChatbotPersonaDto.PersonaOptionDto.builder()
                        .key(TONE_OFFICIAL_COLLECTIVE)
                        .name("Người dùng - Chúng tôi")
                        .botPronoun("Chúng tôi")
                        .userPronoun("Người dùng / Quý khách")
                        .description("Đại diện cơ quan / Tập thể: Phong cách tập thể ban biên tập Cổng Dịch vụ công.")
                        .sampleGreeting("Kính chào Người dùng! Cổng Dịch vụ công chúng tôi sẵn sàng giải đáp thắc mắc của bạn.")
                        .sampleResponse("Cổng DVC chúng tôi xin thông báo về thành phần hồ sơ theo quy định gồm có...")
                        .build()
        );

        ChatbotPersonaDto.PersonaOptionDto selected = options.stream()
                .filter(o -> o.getKey().equalsIgnoreCase(activeKey))
                .findFirst()
                .orElse(options.get(0));

        return ChatbotPersonaDto.builder()
                .currentTone(selected.getKey())
                .currentToneName(selected.getName())
                .currentBotPronoun(selected.getBotPronoun())
                .currentUserPronoun(selected.getUserPronoun())
                .welcomeGreeting(selected.getSampleGreeting())
                .availableOptions(options)
                .build();
    }

    private Optional<User> getCurrentUserOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }
        return userRepository.findByUsername(auth.getName());
    }
}
