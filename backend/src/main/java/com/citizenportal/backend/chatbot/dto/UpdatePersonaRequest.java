package com.citizenportal.backend.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePersonaRequest {

    @NotBlank(message = "Mã phong cách xưng hô không được để trống")
    private String toneKey;
}
