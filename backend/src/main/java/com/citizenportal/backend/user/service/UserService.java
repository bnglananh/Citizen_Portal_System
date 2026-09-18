package com.citizenportal.backend.user.service;

import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.common.util.SecurityUtils;
import com.citizenportal.backend.user.dto.*;
import com.citizenportal.backend.user.entity.Role;
import com.citizenportal.backend.user.entity.RoleType;
import com.citizenportal.backend.user.entity.User;
import com.citizenportal.backend.user.mapper.UserMapper;
import com.citizenportal.backend.user.repository.RoleRepository;
import com.citizenportal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDto getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateCurrentUser(UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail().trim())
                && userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email đã được sử dụng bởi tài khoản khác");
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setIdentityCardNumber(request.getIdentityCardNumber());
        user.setAddress(request.getAddress());

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public PageResponse<UserDto> getAllUsers(String search, RoleType role, Pageable pageable) {
        Page<User> page;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        if (!hasSearch && role == null) {
            page = userRepository.findAll(pageable);
        } else if (!hasSearch) {
            page = userRepository.findByRole(role, pageable);
        } else {
            page = userRepository.findByRoleAndSearch(role, search.trim(), pageable);
        }
        return PageResponse.fromPage(page.map(userMapper::toDto));
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Tên đăng nhập '" + username + "' đã tồn tại trên hệ thống");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Địa chỉ email '" + email + "' đã được sử dụng");
        }

        if (request.getIdentityCardNumber() != null && !request.getIdentityCardNumber().isBlank()) {
            if (userRepository.existsByIdentityCardNumber(request.getIdentityCardNumber().trim())) {
                throw new BadRequestException("Số định danh/CCCD '" + request.getIdentityCardNumber().trim() + "' đã tồn tại");
            }
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                try {
                    RoleType roleType = RoleType.valueOf(roleName.trim());
                    Role role = roleRepository.findByName(roleType)
                            .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
                    roles.add(role);
                } catch (IllegalArgumentException ex) {
                    throw new BadRequestException("Vai trò không hợp lệ: " + roleName);
                }
            }
        } else {
            // Mặc định tạo tài khoản Staff nếu Admin không chỉ định
            Role staffRole = roleRepository.findByName(RoleType.ROLE_STAFF)
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "name", RoleType.ROLE_STAFF));
            roles.add(staffRole);
        }

        User newUser = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .email(email)
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .identityCardNumber(request.getIdentityCardNumber() != null ? request.getIdentityCardNumber().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .active(request.isActive())
                .roles(roles)
                .build();

        User savedUser = userRepository.save(newUser);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public UserDto updateUserRoles(Long id, UpdateUserRolesRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            try {
                RoleType roleType = RoleType.valueOf(roleName.trim());
                Role role = roleRepository.findByName(roleType)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
                roles.add(role);
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Vai trò không hợp lệ: " + roleName);
            }
        }

        user.setRoles(roles);
        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Transactional
    public String resetPassword(Long id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        String newPassword = (request != null && request.getNewPassword() != null && !request.getNewPassword().isBlank())
                ? request.getNewPassword().trim()
                : "Dvc@123456";

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return newPassword;
    }

    @Transactional
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(!user.isActive());
        return userMapper.toDto(userRepository.save(user));
    }
}
