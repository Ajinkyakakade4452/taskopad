package com.edigital.taskpad.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notes")
public class Note {
    @Id
    private String id;
    private String title;
    
    @Column(length = 2000)
    private String content;
    private String date;
    private boolean starred;
    private String color;
    
    public Note() {}
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public boolean isStarred() { return starred; }
    public void setStarred(boolean starred) { this.starred = starred; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
