package com.citizenportal.backend.procedure.controller;

import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.procedure.dto.CreateCategoryRequest;
import com.citizenportal.backend.procedure.dto.ProcedureCategoryDto;
import com.citizenportal.backend.procedure.service.ProcedureCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procedure-categories")
@RequiredArgsConstructor
@Tag(name = "Procedure Categories", description = "APIs danh mục lĩnh vực thủ tục hành chính")
public class ProcedureCategoryController {

    private final ProcedureCategoryService categoryService;

    @GetMapping
    @Operation(summary = "Lấy danh sách các lĩnh vực thủ tục đang hoạt động (Public)")
    public ResponseEntity<ApiResponse<List<ProcedureCategoryDto>>> getAllActiveCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllActiveCategories()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Lấy tất cả lĩnh vực bao gồm cả đã ẩn")
    public ResponseEntity<ApiResponse<List<ProcedureCategoryDto>>> getAllCategoriesForAdmin() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một lĩnh vực thủ tục")
    public ResponseEntity<ApiResponse<ProcedureCategoryDto>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Tạo mới lĩnh vực thủ tục")
    public ResponseEntity<ApiResponse<ProcedureCategoryDto>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(categoryService.createCategory(request), "Tạo lĩnh vực thành công"));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Cập nhật lĩnh vực thủ tục")
    public ResponseEntity<ApiResponse<ProcedureCategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateCategory(id, request), "Cập nhật lĩnh vực thành công"));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Xóa (ẩn) lĩnh vực thủ tục")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa lĩnh vực thành công"));
    }
}
