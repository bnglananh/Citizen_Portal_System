package com.citizenportal.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "application.gemini")
@Data
public class GeminiConfig {

    private String apiKey;
    private String model = "gemini-2.0-flash-lite";

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000); // 2.0s timeout kết nối
        factory.setReadTimeout(3500);    // 3.5s timeout chờ phản hồi
        return new RestTemplate(factory);
    }
}
