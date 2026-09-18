package com.citizenportal.backend.chatbot.controller;

import com.citizenportal.backend.chatbot.dto.*;
import com.citizenportal.backend.chatbot.service.ChatbotService;
import com.citizenportal.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chatbot AI (Gemini)", description = "APIs trợ lý ảo hỗ trợ thủ tục hành chính và tra cứu hồ sơ")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Gửi tin nhắn hỏi đáp tới Trợ lý AI và nhận phản hồi")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(chatbotService.sendMessage(request)));
    }

    @GetMapping("/history/{conversationId}")
    @Operation(summary = "Lấy lịch sử tin nhắn của một cuộc hội thoại")
    public ResponseEntity<ApiResponse<ChatConversationDto>> getConversationHistory(@PathVariable Long conversationId) {
        return ResponseEntity.ok(ApiResponse.ok(chatbotService.getConversationHistory(conversationId)));
    }

    @GetMapping("/quick-prompts")
    @Operation(summary = "Lấy danh sách các câu hỏi gợi ý nhanh (Prompts)")
    public ResponseEntity<ApiResponse<List<QuickPromptDto>>> getQuickPrompts() {
        return ResponseEntity.ok(ApiResponse.ok(chatbotService.getQuickPrompts()));
    }

    @GetMapping("/persona")
    @Operation(summary = "Lấy thông tin phong cách xưng hô hiện tại của Trợ lý AI (Public)")
    public ResponseEntity<ApiResponse<ChatbotPersonaDto>> getPublicPersona() {
        return ResponseEntity.ok(ApiResponse.ok(chatbotService.getPublicPersona()));
    }

    @GetMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Lấy chi tiết cấu hình bối cảnh xưng hô Chatbot")
    public ResponseEntity<ApiResponse<ChatbotPersonaDto>> getPersonaSettings() {
        return ResponseEntity.ok(ApiResponse.ok(chatbotService.getPersonaSettings()));
    }

    @PutMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Cập nhật phong cách xưng hô cho Trợ lý AI")
    public ResponseEntity<ApiResponse<ChatbotPersonaDto>> updatePersonaSettings(@Valid @RequestBody UpdatePersonaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(chatbotService.updatePersona(request), "Cập nhật bối cảnh xưng hô Chatbot thành công"));
    }

    @DeleteMapping("/history/{conversationId}")
    @Operation(summary = "Xóa lịch sử cuộc hội thoại")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(@PathVariable Long conversationId) {
        chatbotService.deleteConversation(conversationId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa lịch sử trò chuyện thành công"));
    }
}
