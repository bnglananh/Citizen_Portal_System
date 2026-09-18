package com.citizenportal.backend.notification.repository;

import com.citizenportal.backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    List<Notification> findTop10ByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.recipient.id = :recipientId AND n.read = false")
    int markAllAsRead(@org.springframework.data.repository.query.Param("recipientId") Long recipientId, @org.springframework.data.repository.query.Param("readAt") java.time.LocalDateTime readAt);
}

