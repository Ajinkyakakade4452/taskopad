package com.edigital.taskpad.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private String id;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "type")
    private String type; // e.g. "UNDER_REVIEW", "COMPLETED", "DOCUMENTS_ATTACHED"

    private String title;

    @Column(length = 2000)
    private String message;


    @Column(name = "is_read")
    private boolean read;

    @Column(name = "created_at")
    private Instant createdAt;

    public Notification() {}

    public Notification(String id, String userEmail, String type, String title, String message, boolean read, Instant createdAt) {
        this.id = id;
        this.userEmail = userEmail;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = "ntf-" + System.currentTimeMillis();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

