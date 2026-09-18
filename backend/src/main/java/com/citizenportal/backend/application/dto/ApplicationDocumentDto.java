package com.citizenportal.backend.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDocumentDto {
    private Long id;
    private Long requiredDocumentId;
    private String documentName;
    private String originalFileName;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private LocalDateTime createdAt;
}
