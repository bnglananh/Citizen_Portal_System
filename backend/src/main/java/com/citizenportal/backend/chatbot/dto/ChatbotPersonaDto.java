package com.citizenportal.backend.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotPersonaDto {

    private String currentTone;
    private String currentToneName;
    private String currentBotPronoun;
    private String currentUserPronoun;
    private String welcomeGreeting;
    private List<PersonaOptionDto> availableOptions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PersonaOptionDto {
        private String key;
        private String name;
        private String botPronoun;
        private String userPronoun;
        private String description;
        private String sampleGreeting;
        private String sampleResponse;
    }
}
