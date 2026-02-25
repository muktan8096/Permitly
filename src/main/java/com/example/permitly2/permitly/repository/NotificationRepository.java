package com.example.permitly2.permitly.repository;

import com.example.permitly2.permitly.entity.Notification;
import com.example.permitly2.permitly.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(Long userId);

    long countByRecipient_IdAndReadFalse(Long userId);

    boolean existsByRecipient_IdAndTypeAndRelatedRequestIdAndMessage(
            Long recipientId,
            NotificationType type,
            String relatedRequestId,
            String message
    );
}
