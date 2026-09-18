package com.citizenportal.backend.procedure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedureCategoryDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String icon;
    private boolean active;
    private LocalDateTime createdAt;
}
