package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.Notification;
import com.edigital.taskpad.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // NOTE: This app doesn't have real auth. Frontend passes userEmail.
    // Admin can request notifications for any email.
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam(value = "userEmail", required = false) String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        // minimal internal endpoint (optional)
        return ResponseEntity.ok(Map.of("message", "Not implemented"));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<?> markRead(@RequestBody Map<String, Object> payload) {
        Object idObj = payload.get("id");
        if (idObj == null) return ResponseEntity.badRequest().body(Map.of("message", "id is required"));
        String id = String.valueOf(idObj);

        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });

        return ResponseEntity.ok().build();
    }
}

