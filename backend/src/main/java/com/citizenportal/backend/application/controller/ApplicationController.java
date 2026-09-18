package com.citizenportal.backend.application.controller;

import com.citizenportal.backend.application.dto.ApplicationDetailDto;
import com.citizenportal.backend.application.dto.ApplicationDocumentDto;
import com.citizenportal.backend.application.dto.ApplicationHistoryDto;
import com.citizenportal.backend.application.dto.ApplicationSummaryDto;
import com.citizenportal.backend.application.dto.CreateApplicationRequest;
import com.citizenportal.backend.application.entity.ApplicationStatus;
import com.citizenportal.backend.application.service.ApplicationService;
import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.common.util.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications (Citizen)", description = "APIs tạo, nộp và theo dõi hồ sơ của người dân")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final FileStorageService fileStorageService;

    @PostMapping("/draft")
    @Operation(summary = "Tạo hồ sơ nháp mới (Citizen)")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> createDraft(@Valid @RequestBody CreateApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(applicationService.createDraft(request), "Khởi tạo hồ sơ nháp thành công"));
    }

    @PostMapping("/{id}/documents")
    @Operation(summary = "Tải lên tệp tài liệu đính kèm cho hồ sơ")
    public ResponseEntity<ApiResponse<ApplicationDocumentDto>> uploadDocument(
            @PathVariable Long id,
            @RequestParam(required = false) Long requiredDocumentId,
            @RequestParam(required = false) String documentName,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(applicationService.uploadDocument(id, requiredDocumentId, documentName, file), "Tải lên tài liệu thành công"));
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    @Operation(summary = "Xóa tệp tài liệu đính kèm của hồ sơ nháp")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id, @PathVariable Long documentId) {
        applicationService.deleteDocument(id, documentId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa tài liệu thành công"));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Nộp chính thức hồ sơ trực tuyến (chuyển DRAFT -> SUBMITTED)")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> submitApplication(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.submitApplication(id), "Nộp hồ sơ thành công"));
    }

    @PostMapping("/{id}/resubmit")
    @Operation(summary = "Nộp lại hồ sơ sau khi đã bổ sung tài liệu (chuyển NEED_REVISION -> RESUBMITTED)")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> resubmitApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String revisionNotes = payload != null ? payload.get("revisionNotes") : null;
        return ResponseEntity.ok(ApiResponse.ok(applicationService.resubmitApplication(id, revisionNotes), "Nộp lại hồ sơ bổ sung thành công"));
    }

    @GetMapping("/my")
    @Operation(summary = "Lấy danh sách hồ sơ của công dân hiện tại")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationSummaryDto>>> getMyApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getMyApplications(status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết hồ sơ (bao gồm danh sách tài liệu và lịch sử xử lý)")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> getApplicationDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationDetail(id)));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Lấy lịch sử chuyển trạng thái (Timeline) của hồ sơ")
    public ResponseEntity<ApiResponse<List<ApplicationHistoryDto>>> getApplicationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationHistory(id)));
    }

    @GetMapping("/public/track/{code}")
    @Operation(summary = "Tra cứu công khai thông tin hồ sơ theo Mã hồ sơ (không cần đăng nhập)")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> trackApplicationByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationByCodePublic(code)));
    }

    @GetMapping("/download")
    @Operation(summary = "Tải về hoặc xem tệp tài liệu đính kèm")
    public ResponseEntity<Resource> downloadFile(@RequestParam("filePath") String filePath, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(filePath);
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ignored) {}

        if (contentType == null) {
            String lower = filePath.toLowerCase();
            if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
            else if (lower.endsWith(".pdf")) contentType = "application/pdf";
            else contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
