package com.citizenportal.backend.application.controller;

import com.citizenportal.backend.application.dto.ApplicationDetailDto;
import com.citizenportal.backend.application.dto.ApplicationSummaryDto;
import com.citizenportal.backend.application.dto.StaffActionRequest;
import com.citizenportal.backend.application.entity.ApplicationStatus;
import com.citizenportal.backend.application.service.ApplicationService;
import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/staff/applications")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Staff Applications", description = "APIs dành cho Cán bộ tiếp nhận và thẩm định hồ sơ")
public class StaffApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @Operation(summary = "[Staff] Lấy danh sách hồ sơ cần thẩm định kèm tìm kiếm và lọc trạng thái")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationSummaryDto>>> getStaffApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getStaffApplications(status, keyword, pageable)));
    }

    @PostMapping(value = "/{id}/action", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @Operation(summary = "[Staff] Thực hiện hành động tiếp nhận / chuyển xử lý / yêu cầu bổ sung / từ chối / hoàn tất")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> performStaffAction(
            @PathVariable Long id,
            @RequestPart("data") StaffActionRequest request,
            @RequestPart(value = "resultFile", required = false) MultipartFile resultFile
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                applicationService.performStaffAction(id, request, resultFile),
                "Thực hiện hành động thành công"
        ));
    }

    @PostMapping(value = "/{id}/action-simple")
    @Operation(summary = "[Staff] Thực hiện hành động xử lý đơn giản (JSON không kèm tệp kết quả)")
    public ResponseEntity<ApiResponse<ApplicationDetailDto>> performStaffActionSimple(
            @PathVariable Long id,
            @RequestBody StaffActionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                applicationService.performStaffAction(id, request, null),
                "Thực hiện hành động thành công"
        ));
    }
}
