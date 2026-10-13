package com.citizenportal.backend.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportMessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private String attachmentUrl;
    private String attachmentName;
    private String attachmentType;
    private boolean isRead;
    private LocalDateTime createdAt;
}
