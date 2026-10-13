package com.citizenportal.backend.support.dto;

import com.citizenportal.backend.support.entity.SupportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportConversationDto {
    private Long id;
    private Long citizenId;
    private String citizenName;
    private String citizenPhone;
    private String citizenEmail;

    private Long staffId;
    private String staffName;
    private String staffEmail;

    private String subject;
    private SupportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private SupportMessageDto lastMessage;
    private int unreadCount;
}
