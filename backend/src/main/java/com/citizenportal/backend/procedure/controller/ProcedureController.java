package com.citizenportal.backend.procedure.controller;

import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.procedure.dto.CreateProcedureRequest;
import com.citizenportal.backend.procedure.dto.ProcedureDto;
import com.citizenportal.backend.procedure.service.ProcedureService;
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

@RestController
@RequestMapping("/api/procedures")
@RequiredArgsConstructor
@Tag(name = "Procedures", description = "APIs danh mục thủ tục hành chính")
public class ProcedureController {

    private final ProcedureService procedureService;

    @GetMapping
    @Operation(summary = "Tìm kiếm & lọc thủ tục hành chính công khai (Citizen)")
    public ResponseEntity<ApiResponse<PageResponse<ProcedureDto>>> searchProcedures(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(procedureService.searchPublicProcedures(keyword, categoryId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một thủ tục hành chính theo ID")
    public ResponseEntity<ApiResponse<ProcedureDto>> getProcedureById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(procedureService.getProcedureById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Xem chi tiết một thủ tục hành chính theo Mã thủ tục")
    public ResponseEntity<ApiResponse<ProcedureDto>> getProcedureByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(procedureService.getProcedureByCode(code)));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Tạo mới thủ tục hành chính kèm danh sách hồ sơ bắt buộc")
    public ResponseEntity<ApiResponse<ProcedureDto>> createProcedure(@Valid @RequestBody CreateProcedureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(procedureService.createProcedure(request), "Tạo thủ tục thành công"));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Cập nhật thủ tục hành chính")
    public ResponseEntity<ApiResponse<ProcedureDto>> updateProcedure(
            @PathVariable Long id,
            @Valid @RequestBody CreateProcedureRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(procedureService.updateProcedure(id, request), "Cập nhật thủ tục thành công"));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Xóa (ẩn) thủ tục hành chính")
    public ResponseEntity<ApiResponse<Void>> deleteProcedure(@PathVariable Long id) {
        procedureService.deleteProcedure(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa thủ tục thành công"));
    }
}
