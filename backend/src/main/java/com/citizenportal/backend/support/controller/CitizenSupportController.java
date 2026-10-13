package com.citizenportal.backend.support.controller;

import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.support.dto.SupportConversationDto;
import com.citizenportal.backend.support.dto.SupportMessageDto;
import com.citizenportal.backend.support.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/support/citizen")
@RequiredArgsConstructor
@Tag(name = "Citizen Support", description = "APIs hỗ trợ khẩn cấp trực tiếp cho công dân")
public class CitizenSupportController {

    private final SupportService supportService;

    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy hoặc tạo mới phiên hỗ trợ khẩn cấp của công dân (tự động phân công ngẫu nhiên cán bộ)")
    public ResponseEntity<ApiResponse<SupportConversationDto>> getCurrentConversation() {
        return ResponseEntity.ok(ApiResponse.ok(supportService.getOrCreateCitizenConversation()));
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy danh sách tin nhắn của phiên hỗ trợ")
    public ResponseEntity<ApiResponse<List<SupportMessageDto>>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supportService.getConversationMessages(id)));
    }

    @PostMapping(value = "/conversations/{id}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Công dân gửi tin nhắn hỗ trợ (cho phép văn bản và tài liệu/hình ảnh đính kèm)")
    public ResponseEntity<ApiResponse<SupportMessageDto>> sendMessage(
            @PathVariable Long id,
            @RequestParam(value = "content", required = false) String content,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.ok(supportService.sendMessage(id, content, file), "Gửi tin nhắn thành công"));
    }

    @PostMapping("/conversations/{id}/resolve")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đánh dấu kết thúc phiên hỗ trợ khẩn cấp")
    public ResponseEntity<ApiResponse<Void>> resolveConversation(@PathVariable Long id) {
        supportService.resolveConversation(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã hoàn tất phiên hỗ trợ"));
    }
}
