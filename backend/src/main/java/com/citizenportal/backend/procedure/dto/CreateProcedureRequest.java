package com.citizenportal.backend.procedure.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProcedureRequest {

    @NotBlank(message = "Mã thủ tục không được để trống")
    @Size(max = 50, message = "Mã thủ tục tối đa 50 ký tự")
    private String code;

    @NotBlank(message = "Tên thủ tục không được để trống")
    @Size(max = 255, message = "Tên thủ tục tối đa 255 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Danh mục thủ tục không được để trống")
    private Long categoryId;

    @NotNull(message = "Thời gian giải quyết không được để trống")
    @Min(value = 0, message = "Thời gian giải quyết phải lớn hơn hoặc bằng 0")
    private Integer processingDurationDays;

    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    private String submissionMethod;

    private String implementationSteps;

    private String conditions;

    private String legalBasis;

    @Builder.Default
    private boolean active = true;

    private List<CreateRequiredDocRequest> requiredDocuments;
}
