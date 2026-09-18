package com.citizenportal.backend.chatbot.repository;

import com.citizenportal.backend.chatbot.entity.ChatbotSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatbotSettingRepository extends JpaRepository<ChatbotSetting, Long> {

    Optional<ChatbotSetting> findBySettingKey(String settingKey);

    boolean existsBySettingKey(String settingKey);
}
