package com.citizenportal.backend.dashboard.controller;

import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.dashboard.dto.DashboardSummaryDto;
import com.citizenportal.backend.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs thống kê số liệu tổng quan theo từng vai trò")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/citizen")
    @Operation(summary = "Thống kê hồ sơ cá nhân của công dân hiện tại")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getCitizenStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getCitizenStats()));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "[Staff] Thống kê hồ sơ cần tiếp nhận, đang xử lý của cán bộ")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getStaffStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStaffStats()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Thống kê tổng quan toàn hệ thống (Users, Procedures, Applications)")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getAdminStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getAdminStats()));
    }
}
