package com.citizenportal.backend.procedure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedureRequiredDocumentDto {
    private Long id;
    private String documentName;
    private String description;
    private boolean required;
    private String templateFilePath;
    private Integer orderIndex;
}
