package com.citizenportal.backend.auth.service;

import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.service.EmailService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    // 5 minutes expiry
    private static final long OTP_VALID_DURATION_MS = 5 * 60 * 1000L;
    // 45 seconds cooldown between resends
    private static final long OTP_RESEND_COOLDOWN_MS = 45 * 1000L;

    @Data
    @AllArgsConstructor
    private static class OtpEntry {
        private String code;
        private long createdAt;
        private long expiresAt;
        private long lastSentAt;
    }

    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    /**
     * Sinh mã OTP 6 số và gửi qua Gmail
     */
    public void sendRegistrationOtp(String email, String fullName) {
        String normalizedEmail = email.trim().toLowerCase();
        long now = System.currentTimeMillis();

        OtpEntry existing = otpStorage.get(normalizedEmail);
        if (existing != null && (now - existing.getLastSentAt() < OTP_RESEND_COOLDOWN_MS)) {
            long remainingSeconds = (OTP_RESEND_COOLDOWN_MS - (now - existing.getLastSentAt())) / 1000;
            throw new BadRequestException("Vui lòng đợi " + remainingSeconds + " giây trước khi yêu cầu gửi lại mã OTP mới.");
        }

        String otpCode = String.format("%06d", secureRandom.nextInt(1_000_000));
        OtpEntry entry = new OtpEntry(otpCode, now, now + OTP_VALID_DURATION_MS, now);
        otpStorage.put(normalizedEmail, entry);

        // Send via Email Service
        emailService.sendRegistrationOtp(normalizedEmail, otpCode, fullName);
    }

    /**
     * Xác thực mã OTP
     */
    public boolean verifyOtp(String email, String inputCode) {
        if (email == null || inputCode == null || inputCode.isBlank()) {
            return false;
        }

        String normalizedEmail = email.trim().toLowerCase();
        OtpEntry entry = otpStorage.get(normalizedEmail);

        if (entry == null) {
            log.warn("Mã OTP không tồn tại cho email: {}", normalizedEmail);
            return false;
        }

        long now = System.currentTimeMillis();
        if (now > entry.getExpiresAt()) {
            log.warn("Mã OTP đã hết hạn cho email: {}", normalizedEmail);
            otpStorage.remove(normalizedEmail);
            return false;
        }

        boolean matched = entry.getCode().equals(inputCode.trim());
        if (matched) {
            log.info("Xác thực OTP thành công cho email: {}", normalizedEmail);
            otpStorage.remove(normalizedEmail); // One-time use
        }
        return matched;
    }
}
