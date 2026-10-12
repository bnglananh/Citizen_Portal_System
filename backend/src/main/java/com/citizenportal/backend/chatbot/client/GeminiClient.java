package com.citizenportal.backend.chatbot.client;

import com.citizenportal.backend.config.GeminiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiClient {

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    /**
     * Gọi Gemini API để sinh nội dung phản hồi
     *
     * @param systemInstruction Ngữ cảnh & chỉ dẫn cho hệ thống (System Prompt)
     * @param userMessage       Câu hỏi của người dùng
     * @param conversationHistory Lịch sử các tin nhắn trước (role: user/model)
     * @return Văn bản câu trả lời từ Gemini
     */
    public String generateContent(String systemInstruction, String userMessage, List<Map<String, String>> conversationHistory) {
        String apiKey = geminiConfig.getApiKey();
        if (!StringUtils.hasText(apiKey) || apiKey.trim().isEmpty()) {
            log.debug("Gemini API Key is not configured. Using local Fallback Engine.");
            return null;
        }

        try {
            String model = StringUtils.hasText(geminiConfig.getModel()) ? geminiConfig.getModel() : "gemini-2.0-flash-lite";
            String url = String.format(GEMINI_API_URL, model, apiKey);

            Map<String, Object> requestBody = new HashMap<>();

            // 1. System instruction
            if (StringUtils.hasText(systemInstruction)) {
                Map<String, Object> sysInstructionMap = new HashMap<>();
                sysInstructionMap.put("parts", List.of(Map.of("text", systemInstruction)));
                requestBody.put("systemInstruction", sysInstructionMap);
            }

            // 2. Contents (Lịch sử hội thoại + câu hỏi mới)
            List<Map<String, Object>> contents = new ArrayList<>();
            if (conversationHistory != null) {
                for (Map<String, String> historyItem : conversationHistory) {
                    String role = "user".equalsIgnoreCase(historyItem.get("senderType")) ? "user" : "model";
                    String text = historyItem.get("content");
                    if (StringUtils.hasText(text)) {
                        contents.add(Map.of(
                                "role", role,
                                "parts", List.of(Map.of("text", text))
                        ));
                    }
                }
            }

            // Thêm câu hỏi hiện tại
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", userMessage))
            ));
            requestBody.put("contents", contents);

            // 3. Generation Config (Tối ưu phản hồi nhanh)
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.3);
            genConfig.put("maxOutputTokens", 800);
            requestBody.put("generationConfig", genConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            long latencyMs = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        log.info("Gemini API (model: {}) responded successfully in {}ms", model, latencyMs);
                        return textNode.asText();
                    }
                }
            }
        } catch (org.springframework.web.client.ResourceAccessException ex) {
            log.warn("Gemini API timed out or network unreachable ({}). Instant fallback to local engine.", ex.getMessage());
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            log.warn("Gemini API returned HTTP status {}. Instant fallback to local engine.", ex.getStatusCode());
        } catch (Exception e) {
            log.warn("Gemini API call failed ({}). Instant fallback to local engine.", e.getMessage());
        }

        return null;
    }
}
