package com.citizenportal.backend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long applicationId;
    private String applicationCode;
    private String title;
    private String content;
    private String notificationType;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
