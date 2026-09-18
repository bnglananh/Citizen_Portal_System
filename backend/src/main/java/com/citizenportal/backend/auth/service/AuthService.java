package com.citizenportal.backend.auth.service;

import com.citizenportal.backend.auth.dto.AuthResponse;
import com.citizenportal.backend.auth.dto.LoginRequest;
import com.citizenportal.backend.auth.dto.RegisterRequest;
import com.citizenportal.backend.auth.dto.SendOtpRequest;
import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.security.CustomUserDetails;
import com.citizenportal.backend.security.JwtService;
import com.citizenportal.backend.user.entity.Role;
import com.citizenportal.backend.user.entity.RoleType;
import com.citizenportal.backend.user.entity.User;
import com.citizenportal.backend.user.mapper.UserMapper;
import com.citizenportal.backend.user.repository.RoleRepository;
import com.citizenportal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final OtpService otpService;

    @Value("${application.security.jwt.expiration-ms:86400000}")
    private long jwtExpiration;

    public void sendRegistrationOtp(SendOtpRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Vui lòng cung cấp địa chỉ email hợp lệ");
        }

        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Địa chỉ email này đã được sử dụng trong hệ thống");
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()
                && userRepository.existsByUsername(request.getUsername().trim())) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại trong hệ thống");
        }

        if (request.getIdentityCardNumber() != null && !request.getIdentityCardNumber().isBlank()
                && userRepository.existsByIdentityCardNumber(request.getIdentityCardNumber().trim())) {
            throw new BadRequestException("Số CCCD/CMND đã tồn tại trong hệ thống");
        }

        otpService.sendRegistrationOtp(request.getEmail().trim(), request.getFullName());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại trong hệ thống");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được đăng ký trong hệ thống");
        }
        if (request.getIdentityCardNumber() != null && !request.getIdentityCardNumber().isBlank()
                && userRepository.existsByIdentityCardNumber(request.getIdentityCardNumber())) {
            throw new BadRequestException("Số CCCD/CMND đã tồn tại trong hệ thống");
        }

        // Verify OTP code
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new BadRequestException("Mã xác thực OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.");
        }

        Role citizenRole = roleRepository.findByName(RoleType.ROLE_CITIZEN)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò ROLE_CITIZEN trong hệ thống"));

        User user = User.builder()
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .phoneNumber(request.getPhoneNumber())
                .identityCardNumber(request.getIdentityCardNumber())
                .address(request.getAddress())
                .active(true)
                .roles(new HashSet<>(Collections.singletonList(citizenRole)))
                .build();

        User savedUser = userRepository.save(user);
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(userMapper.toDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail().trim(),
                        request.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (!user.isActive()) {
            throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa");
        }

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(userMapper.toDto(user))
                .build();
    }
}
