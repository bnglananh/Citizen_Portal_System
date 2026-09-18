package com.citizenportal.backend.common.util;

import com.citizenportal.backend.common.exception.ForbiddenException;
import com.citizenportal.backend.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<CustomUserDetails> getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails);
        }
        return Optional.empty();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserDetails()
                .map(CustomUserDetails::getId)
                .orElseThrow(() -> new ForbiddenException("Không tìm thấy thông tin định danh của người dùng hiện tại"));
    }

    public static String getCurrentUsername() {
        return getCurrentUserDetails()
                .map(CustomUserDetails::getUsername)
                .orElseThrow(() -> new ForbiddenException("Không tìm thấy thông tin tài khoản"));
    }
}
