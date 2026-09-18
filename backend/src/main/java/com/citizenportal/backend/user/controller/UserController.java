package com.citizenportal.backend.user.controller;

import com.citizenportal.backend.common.response.ApiResponse;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.user.dto.ChangePasswordRequest;
import com.citizenportal.backend.user.dto.UpdateProfileRequest;
import com.citizenportal.backend.user.dto.UserDto;
import com.citizenportal.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs quản lý thông tin tài khoản người dùng")
public class UserController {

    private final UserService userService;

    @GetMapping("/users/me")
    @Operation(summary = "Xem thông tin cá nhân của người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser()));
    }

    @PutMapping("/users/me")
    @Operation(summary = "Cập nhật thông tin cá nhân của người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.updateCurrentUser(request), "Cập nhật thông tin thành công"));
    }

    @PutMapping("/users/me/change-password")
    @Operation(summary = "Đổi mật khẩu người dùng hiện tại")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Đổi mật khẩu thành công"));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Lấy danh sách tất cả người dùng kèm phân trang, tìm kiếm và lọc vai trò")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.citizenportal.backend.user.entity.RoleType role,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers(search, role, pageable)));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Tạo mới tài khoản người dùng / cán bộ (Staff / Admin)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody com.citizenportal.backend.user.dto.CreateUserRequest request) {
        UserDto createdUser = userService.createUser(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.ok(createdUser, "Khởi tạo tài khoản thành công"));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Xem chi tiết thông tin một người dùng theo ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PutMapping("/admin/users/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Cập nhật / Phân quyền danh sách vai trò của người dùng")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody com.citizenportal.backend.user.dto.UpdateUserRolesRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(userService.updateUserRoles(id, request), "Cập nhật vai trò thành công"));
    }

    @PostMapping("/admin/users/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Đặt lại mật khẩu cho tài khoản người dùng")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> resetPassword(
            @PathVariable Long id,
            @RequestBody(required = false) com.citizenportal.backend.user.dto.ResetPasswordRequest request
    ) {
        String newPass = userService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok(
                java.util.Map.of("message", "Đặt lại mật khẩu thành công", "newPassword", newPass)
        ));
    }

    @PatchMapping("/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "[Admin] Khóa / Mở khóa tài khoản người dùng")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.toggleUserStatus(id), "Cập nhật trạng thái tài khoản thành công"));
    }
}
