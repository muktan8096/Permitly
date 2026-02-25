package com.example.permitly2.permitly.service;

import com.example.permitly2.permitly.entity.*;
import com.example.permitly2.permitly.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(
            User recipient,
            String message,
            NotificationType type,
            String relatedRequestId
    ) {
        if (recipient == null) {
            return;
        }

        boolean alreadyExists = notificationRepository
                .existsByRecipient_IdAndTypeAndRelatedRequestIdAndMessage(
                        recipient.getId(),
                        type,
                        relatedRequestId,
                        message
                );

        if (alreadyExists) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .read(false)
                .relatedRequestId(relatedRequestId)
                .build();

        notificationRepository.save(notification);
    }
}
