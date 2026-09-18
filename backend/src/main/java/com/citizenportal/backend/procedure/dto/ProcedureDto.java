package com.citizenportal.backend.procedure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedureDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private ProcedureCategoryDto category;
    private Integer processingDurationDays;
    private BigDecimal fee;
    private String submissionMethod;
    private String implementationSteps;
    private String conditions;
    private String legalBasis;
    private boolean active;
    private List<ProcedureRequiredDocumentDto> requiredDocuments;
    private LocalDateTime createdAt;
}
