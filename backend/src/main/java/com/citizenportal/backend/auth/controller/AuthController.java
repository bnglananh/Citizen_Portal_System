package com.citizenportal.backend.auth.controller;

import com.citizenportal.backend.auth.dto.AuthResponse;
import com.citizenportal.backend.auth.dto.LoginRequest;
import com.citizenportal.backend.auth.dto.RegisterRequest;
import com.citizenportal.backend.auth.service.AuthService;
import com.citizenportal.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs xác thực, đăng ký, đăng nhập")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-register-otp")
    @Operation(summary = "Gửi mã OTP xác thực đăng ký tài khoản qua Gmail")
    public ResponseEntity<ApiResponse<Void>> sendRegisterOtp(@Valid @RequestBody com.citizenportal.backend.auth.dto.SendOtpRequest request) {
        authService.sendRegistrationOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Mã xác thực OTP đã được gửi tới email " + request.getEmail()));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản công dân (Citizen) kèm xác thực OTP")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Đăng ký tài khoản thành công"));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống (Citizen / Staff / Admin)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng nhập thành công"));
    }
}
