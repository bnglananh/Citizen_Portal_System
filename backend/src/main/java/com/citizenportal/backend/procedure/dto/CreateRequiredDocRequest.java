package com.citizenportal.backend.procedure.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequiredDocRequest {

    @NotBlank(message = "Tên thành phần hồ sơ không được để trống")
    private String documentName;

    private String description;

    @Builder.Default
    private boolean required = true;

    private String templateFilePath;

    @Builder.Default
    private Integer orderIndex = 0;
}
