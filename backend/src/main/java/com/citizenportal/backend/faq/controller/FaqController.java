package com.citizenportal.backend.faq.controller;

import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.faq.dto.CreateFaqRequest;
import com.citizenportal.backend.faq.dto.FaqDto;
import com.citizenportal.backend.faq.service.FaqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
@Tag(name = "FAQs", description = "APIs danh mục câu hỏi thường gặp (hỗ trợ Chatbot)")
public class FaqController {

    private final FaqService faqService;

    @GetMapping("/public")
    @Operation(summary = "Lấy danh sách các câu hỏi thường gặp (Public)")
    public ResponseEntity<ApiResponse<List<FaqDto>>> getPublicFaqs() {
        return ResponseEntity.ok(ApiResponse.ok(faqService.getPublicFaqs()));
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm câu hỏi FAQ kèm phân trang")
    public ResponseEntity<ApiResponse<PageResponse<FaqDto>>> searchFaqs(
            @RequestParam(required = false) String keyword,
            @PageableDefault(page = 0, size = 10, sort = "orderIndex", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(faqService.searchFaqs(keyword, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một câu hỏi FAQ")
    public ResponseEntity<ApiResponse<FaqDto>> getFaqById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(faqService.getFaqById(id)));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Tạo mới câu hỏi FAQ")
    public ResponseEntity<ApiResponse<FaqDto>> createFaq(@Valid @RequestBody CreateFaqRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(faqService.createFaq(request), "Tạo FAQ thành công"));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Cập nhật câu hỏi FAQ")
    public ResponseEntity<ApiResponse<FaqDto>> updateFaq(@PathVariable Long id, @Valid @RequestBody CreateFaqRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(faqService.updateFaq(id, request), "Cập nhật FAQ thành công"));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Xóa (ẩn) câu hỏi FAQ")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa FAQ thành công"));
    }
}
