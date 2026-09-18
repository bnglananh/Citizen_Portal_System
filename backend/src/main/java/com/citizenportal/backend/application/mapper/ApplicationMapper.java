package com.citizenportal.backend.application.mapper;

import com.citizenportal.backend.application.dto.ApplicationDetailDto;
import com.citizenportal.backend.application.dto.ApplicationDocumentDto;
import com.citizenportal.backend.application.dto.ApplicationHistoryDto;
import com.citizenportal.backend.application.dto.ApplicationSummaryDto;
import com.citizenportal.backend.application.entity.Application;
import com.citizenportal.backend.application.entity.ApplicationDocument;
import com.citizenportal.backend.application.entity.ApplicationHistory;
import com.citizenportal.backend.procedure.mapper.ProcedureMapper;
import com.citizenportal.backend.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApplicationMapper {

    private final UserMapper userMapper;
    private final ProcedureMapper procedureMapper;

    public ApplicationDocumentDto toDocumentDto(ApplicationDocument doc) {
        if (doc == null) return null;
        return ApplicationDocumentDto.builder()
                .id(doc.getId())
                .requiredDocumentId(doc.getRequiredDocument() != null ? doc.getRequiredDocument().getId() : null)
                .documentName(doc.getDocumentName())
                .originalFileName(doc.getOriginalFileName())
                .filePath(doc.getFilePath())
                .fileSize(doc.getFileSize())
                .fileType(doc.getFileType())
                .createdAt(doc.getCreatedAt())
                .build();
    }

    public ApplicationHistoryDto toHistoryDto(ApplicationHistory h) {
        if (h == null) return null;
        return ApplicationHistoryDto.builder()
                .id(h.getId())
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .actionName(h.getActionName())
                .comments(h.getComments())
                .actionByUserName(h.getActionBy() != null ? h.getActionBy().getUsername() : "Hệ thống")
                .actionByUserFullName(h.getActionBy() != null ? h.getActionBy().getFullName() : "Hệ thống tự động")
                .actionTime(h.getActionTime())
                .build();
    }

    public ApplicationSummaryDto toSummaryDto(Application a) {
        if (a == null) return null;
        return ApplicationSummaryDto.builder()
                .id(a.getId())
                .applicationCode(a.getApplicationCode())
                .procedureId(a.getProcedure() != null ? a.getProcedure().getId() : null)
                .procedureCode(a.getProcedure() != null ? a.getProcedure().getCode() : null)
                .procedureName(a.getProcedure() != null ? a.getProcedure().getName() : null)
                .categoryName(a.getProcedure() != null && a.getProcedure().getCategory() != null
                        ? a.getProcedure().getCategory().getName() : null)
                .applicantName(a.getApplicantName())
                .applicantPhone(a.getApplicantPhone())
                .status(a.getStatus())
                .statusDisplayName(a.getStatus() != null ? a.getStatus().getDisplayName() : null)
                .fee(a.getProcedure() != null ? a.getProcedure().getFee() : null)
                .submittedAt(a.getSubmittedAt())
                .expectedCompletionDate(a.getExpectedCompletionDate())
                .completedAt(a.getCompletedAt())
                .createdAt(a.getCreatedAt())
                .build();
    }

    public ApplicationDetailDto toDetailDto(Application a) {
        if (a == null) return null;
        return ApplicationDetailDto.builder()
                .id(a.getId())
                .applicationCode(a.getApplicationCode())
                .citizen(userMapper.toDto(a.getCitizen()))
                .procedure(procedureMapper.toDto(a.getProcedure()))
                .assignedStaff(userMapper.toDto(a.getAssignedStaff()))
                .status(a.getStatus())
                .statusDisplayName(a.getStatus() != null ? a.getStatus().getDisplayName() : null)
                .applicantName(a.getApplicantName())
                .applicantPhone(a.getApplicantPhone())
                .applicantEmail(a.getApplicantEmail())
                .applicantIdCard(a.getApplicantIdCard())
                .applicantAddress(a.getApplicantAddress())
                .formData(a.getFormData())
                .submittedAt(a.getSubmittedAt())
                .expectedCompletionDate(a.getExpectedCompletionDate())
                .completedAt(a.getCompletedAt())
                .rejectionReason(a.getRejectionReason())
                .revisionNotes(a.getRevisionNotes())
                .resultSummary(a.getResultSummary())
                .resultFilePath(a.getResultFilePath())
                .documents(a.getDocuments() != null
                        ? a.getDocuments().stream().map(this::toDocumentDto).collect(Collectors.toList())
                        : Collections.emptyList())
                .historyList(a.getHistoryList() != null
                        ? a.getHistoryList().stream().map(this::toHistoryDto).collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
