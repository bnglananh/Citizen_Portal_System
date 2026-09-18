package com.citizenportal.backend.chatbot.repository;

import com.citizenportal.backend.chatbot.entity.ChatConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    Page<ChatConversation> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
