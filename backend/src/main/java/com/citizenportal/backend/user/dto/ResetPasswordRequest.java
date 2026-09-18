package com.citizenportal.backend.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @Size(min = 6, max = 100, message = "Mật khẩu mới phải có từ 6 đến 100 ký tự")
    private String newPassword;
}
