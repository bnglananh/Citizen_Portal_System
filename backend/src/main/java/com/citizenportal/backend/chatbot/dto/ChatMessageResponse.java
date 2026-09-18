package com.citizenportal.backend.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;
    private Long conversationId;
    private String senderType; // USER / AI
    private String content;
    private Long referencedProcedureId;
    private Long referencedApplicationId;
    private LocalDateTime createdAt;
}
