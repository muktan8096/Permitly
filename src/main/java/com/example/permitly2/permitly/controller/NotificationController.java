package com.example.permitly2.permitly.controller;

import com.example.permitly2.permitly.entity.Notification;
import com.example.permitly2.permitly.entity.User;
import com.example.permitly2.permitly.repository.NotificationRepository;
import com.example.permitly2.permitly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping("/my")
    public List<Notification> my(Authentication authentication) {
        String email = authentication.getName();
        User me = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(me.getId());
    }

    @GetMapping("/unread-count")
    public long unreadCount(Authentication authentication) {
        String email = authentication.getName();
        User me = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.countByRecipient_IdAndReadFalse(me.getId());
    }

    // ✅ Mark ONE notification as read
    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable String id, Authentication authentication) {
        String email = authentication.getName();
        User me = userRepository.findByEmail(email).orElseThrow();

        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // security: only owner can mark read
        if (!n.getRecipient().getId().equals(me.getId())) {
            throw new RuntimeException("Not your notification");
        }

        // Mark as read
        n.setRead(true);

        return notificationRepository.save(n);
    }
}
