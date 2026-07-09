package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.DiscussionMessage;
import com.edigital.taskpad.repository.DiscussionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    @Autowired
    private DiscussionRepository discussionRepository;

    @GetMapping
    public ResponseEntity<List<DiscussionMessage>> getAllDiscussions() {
        return ResponseEntity.ok(discussionRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<DiscussionMessage> createDiscussion(@RequestBody DiscussionMessage message) {
        if (message.getId() == null || message.getId().isEmpty()) {
            message.setId("disc-" + System.currentTimeMillis());
        }
        DiscussionMessage saved = discussionRepository.save(message);
        return ResponseEntity.ok(saved);
    }
}
