package com.citizenportal.backend.application.dto;

import com.citizenportal.backend.application.entity.ApplicationStatus;
import com.citizenportal.backend.procedure.dto.ProcedureDto;
import com.citizenportal.backend.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailDto {
    private Long id;
    private String applicationCode;
    private UserDto citizen;
    private ProcedureDto procedure;
    private UserDto assignedStaff;
    private ApplicationStatus status;
    private String statusDisplayName;
    private String applicantName;
    private String applicantPhone;
    private String applicantEmail;
    private String applicantIdCard;
    private String applicantAddress;
    private String formData;
    private LocalDateTime submittedAt;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime completedAt;
    private String rejectionReason;
    private String revisionNotes;
    private String resultSummary;
    private String resultFilePath;
    private List<ApplicationDocumentDto> documents;
    private List<ApplicationHistoryDto> historyList;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
