package com.citizenportal.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateApplicationRequest {

    @NotNull(message = "Thủ tục hành chính không được để trống")
    private Long procedureId;

    @NotBlank(message = "Họ và tên người nộp không được để trống")
    @Size(max = 100, message = "Họ và tên tối đa 100 ký tự")
    private String applicantName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    private String applicantPhone;

    private String applicantEmail;

    @NotBlank(message = "Số CCCD/CMND không được để trống")
    @Size(max = 20, message = "Số CCCD/CMND tối đa 20 ký tự")
    private String applicantIdCard;

    private String applicantAddress;

    private String formData; // Dữ liệu form nhập tùy theo thủ tục (JSON string)
}
