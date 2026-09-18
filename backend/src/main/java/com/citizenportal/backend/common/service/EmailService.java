package com.citizenportal.backend.common.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    /**
     * Gửi email OTP xác nhận đăng ký tài khoản
     */
    public void sendRegistrationOtp(String toEmail, String otpCode, String fullName) {
        log.info("==================================================================");
        log.info("📧 [OTP DISPATCH] Gửi mã xác thực đăng ký tài khoản tới Gmail: {}", toEmail);
        log.info("🔑 [OTP CODE] ==> {} <== (Hiệu lực trong 5 phút)", otpCode);
        log.info("==================================================================");

        if (mailSender == null || senderEmail == null || senderEmail.isBlank()) {
            log.warn("⚠️ SMTP Gmail chưa được cấu hình credentials. Mã OTP đã được ghi nhận trong console log phục vụ kiểm thử.");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(senderEmail, "Hệ thống Dịch vụ công Trực tuyến Phường Tân Phú");
            helper.setTo(toEmail);
            helper.setSubject("[DVC Phường Tân Phú] Mã OTP xác thực đăng ký tài khoản: " + otpCode);

            String htmlContent = buildOtpEmailTemplate(fullName, otpCode);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("✅ Đã gửi thành công email OTP tới {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Không thể gửi email qua SMTP: {}. Mã OTP vẫn có hiệu lực trong console.", e.getMessage());
        }
    }

    private String buildOtpEmailTemplate(String fullName, String otpCode) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "Quý công dân";
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3EEE4; margin: 0; padding: 20px; color: #1C1C1A; }
                    .email-container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2DDD2; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                    .email-header { background: #2F5D45; color: #FFFFFF; padding: 24px; text-align: center; }
                    .email-header h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .email-header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
                    .email-body { padding: 30px 24px; }
                    .greeting { font-size: 15px; margin-bottom: 16px; }
                    .otp-box { background: #FAF3E3; border: 2px dashed #C99A3C; border-radius: 10px; text-align: center; padding: 18px; margin: 24px 0; }
                    .otp-label { font-size: 13px; color: #8C6314; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; }
                    .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2F5D45; font-family: monospace; }
                    .otp-expiry { font-size: 12px; color: #9E2A2B; margin-top: 6px; font-weight: 600; }
                    .security-notice { background: #F8F5EE; border-left: 4px solid #2F5D45; padding: 12px 16px; font-size: 13px; color: #5C5B56; border-radius: 4px; margin-top: 20px; line-height: 1.5; }
                    .email-footer { background: #FAF7F0; padding: 16px; text-align: center; font-size: 12px; color: #8C8A82; border-top: 1px solid #ECE8DE; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1>ỦY BAN NHÂN DÂN PHƯỜNG TÂN PHÚ</h1>
                        <p>CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN</p>
                    </div>
                    <div class="email-body">
                        <p class="greeting">Kính gửi <strong>%s</strong>,</p>
                        <p>Bạn vừa thực hiện yêu cầu đăng ký tài khoản trên Cổng Dịch vụ công trực tuyến UBND Phường Tân Phú. Dưới đây là mã xác thực OTP của bạn:</p>
                        
                        <div class="otp-box">
                            <div class="otp-label">MÃ XÁC THỰC (OTP)</div>
                            <div class="otp-code">%s</div>
                            <div class="otp-expiry">⏳ Mã có hiệu lực trong vòng 5 phút</div>
                        </div>

                        <div class="security-notice">
                            <strong>⚠️ Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả cán bộ hỗ trợ. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                        </div>
                    </div>
                    <div class="email-footer">
                        © 2026 Cổng Dịch Vụ Công Trực Tuyến Phường Tân Phú. Email được gửi tự động, vui lòng không phản hồi.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, otpCode);
    }
}
