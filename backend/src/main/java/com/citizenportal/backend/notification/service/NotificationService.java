package com.citizenportal.backend.notification.service;

import com.citizenportal.backend.application.entity.Application;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.common.util.SecurityUtils;
import com.citizenportal.backend.notification.dto.NotificationDto;
import com.citizenportal.backend.notification.entity.Notification;
import com.citizenportal.backend.notification.repository.NotificationRepository;
import com.citizenportal.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User recipient, Application application, String title, String content, String type) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .application(application)
                .title(title)
                .content(content)
                .notificationType(type)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional
    public void notifyUsers(List<User> recipients, Application application, String title, String content, String type) {
        if (recipients == null || recipients.isEmpty()) return;
        List<Notification> notifications = recipients.stream()
                .map(u -> Notification.builder()
                        .recipient(u)
                        .application(application)
                        .title(title)
                        .content(content)
                        .notificationType(type)
                        .read(false)
                        .build())
                .collect(Collectors.toList());
        notificationRepository.saveAll(notifications);
    }

    public PageResponse<NotificationDto> getMyNotifications(Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Notification> page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.fromPage(page.map(this::toDto));
    }

    public List<NotificationDto> getRecentNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findTop10ByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (notification.getRecipient().getId().equals(userId)) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }


    public NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .applicationId(n.getApplication() != null ? n.getApplication().getId() : null)
                .applicationCode(n.getApplication() != null ? n.getApplication().getApplicationCode() : null)
                .title(n.getTitle())
                .content(n.getContent())
                .notificationType(n.getNotificationType())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
