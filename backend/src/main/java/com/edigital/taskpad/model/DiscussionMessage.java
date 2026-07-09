package com.edigital.taskpad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "discussions")
public class DiscussionMessage {
    @Id
    private String id;
    private String userName;
    private String userInitials;
    private String avatarColor;
    private String date;
    
    @Column(length = 1000)
    private String message;
    private String category;
    
    public DiscussionMessage() {}
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getUserInitials() { return userInitials; }
    public void setUserInitials(String userInitials) { this.userInitials = userInitials; }
    
    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
