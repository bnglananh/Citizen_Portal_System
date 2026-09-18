package com.citizenportal.backend.application.dto;

import com.citizenportal.backend.application.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationHistoryDto {
    private Long id;
    private ApplicationStatus fromStatus;
    private ApplicationStatus toStatus;
    private String actionName;
    private String comments;
    private String actionByUserName;
    private String actionByUserFullName;
    private LocalDateTime actionTime;
}
