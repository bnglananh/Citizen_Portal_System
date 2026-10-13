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
@RequestMapping("/api/support/staff")
@RequiredArgsConstructor
@Tag(name = "Staff Support", description = "APIs bàn làm việc hỗ trợ người dân của cán bộ")
public class StaffSupportController {

    private final SupportService supportService;

    @GetMapping("/conversations")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Lấy danh sách các phiên hỗ trợ khẩn cấp được phân công cho cán bộ hiện tại")
    public ResponseEntity<ApiResponse<List<SupportConversationDto>>> getAssignedConversations() {
        return ResponseEntity.ok(ApiResponse.ok(supportService.getStaffConversations()));
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Cán bộ xem chi tiết tin nhắn của phiên hỗ trợ")
    public ResponseEntity<ApiResponse<List<SupportMessageDto>>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supportService.getConversationMessages(id)));
    }

    @PostMapping(value = "/conversations/{id}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Cán bộ gửi tin nhắn phản hồi hỗ trợ (kèm tài liệu/ảnh hướng dẫn)")
    public ResponseEntity<ApiResponse<SupportMessageDto>> sendMessage(
            @PathVariable Long id,
            @RequestParam(value = "content", required = false) String content,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.ok(supportService.sendMessage(id, content, file), "Gửi phản hồi thành công"));
    }

    @PostMapping("/conversations/{id}/resolve")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Cán bộ đánh dấu hoàn tất hỗ trợ cho công dân")
    public ResponseEntity<ApiResponse<Void>> resolveConversation(@PathVariable Long id) {
        supportService.resolveConversation(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đã đánh dấu hoàn tất hỗ trợ"));
    }
}
