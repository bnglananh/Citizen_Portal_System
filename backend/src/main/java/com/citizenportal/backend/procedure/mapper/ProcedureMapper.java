package com.citizenportal.backend.procedure.mapper;

import com.citizenportal.backend.procedure.dto.ProcedureCategoryDto;
import com.citizenportal.backend.procedure.dto.ProcedureDto;
import com.citizenportal.backend.procedure.dto.ProcedureRequiredDocumentDto;
import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.procedure.entity.ProcedureCategory;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class ProcedureMapper {

    public ProcedureCategoryDto toCategoryDto(ProcedureCategory category) {
        if (category == null) return null;
        return ProcedureCategoryDto.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .build();
    }

    public ProcedureRequiredDocumentDto toDocumentDto(ProcedureRequiredDocument doc) {
        if (doc == null) return null;
        return ProcedureRequiredDocumentDto.builder()
                .id(doc.getId())
                .documentName(doc.getDocumentName())
                .description(doc.getDescription())
                .required(doc.isRequired())
                .templateFilePath(doc.getTemplateFilePath())
                .orderIndex(doc.getOrderIndex())
                .build();
    }

    public ProcedureDto toDto(Procedure procedure) {
        if (procedure == null) return null;
        return ProcedureDto.builder()
                .id(procedure.getId())
                .code(procedure.getCode())
                .name(procedure.getName())
                .description(procedure.getDescription())
                .category(toCategoryDto(procedure.getCategory()))
                .processingDurationDays(procedure.getProcessingDurationDays())
                .fee(procedure.getFee())
                .submissionMethod(procedure.getSubmissionMethod())
                .implementationSteps(procedure.getImplementationSteps())
                .conditions(procedure.getConditions())
                .legalBasis(procedure.getLegalBasis())
                .active(procedure.isActive())
                .requiredDocuments(procedure.getRequiredDocuments() != null
                        ? procedure.getRequiredDocuments().stream()
                        .map(this::toDocumentDto)
                        .collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(procedure.getCreatedAt())
                .build();
    }
}
