package com.citizenportal.backend.application.dto;

import com.citizenportal.backend.application.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationSummaryDto {
    private Long id;
    private String applicationCode;
    private Long procedureId;
    private String procedureCode;
    private String procedureName;
    private String categoryName;
    private String applicantName;
    private String applicantPhone;
    private ApplicationStatus status;
    private String statusDisplayName;
    private BigDecimal fee;
    private LocalDateTime submittedAt;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
