package com.edigital.taskpad.model;

public class TimeLog {
    private String id;
    private String user;
    private String duration;
    private String date;

    // Constructors
    public TimeLog() {}

    public TimeLog(String id, String user, String duration, String date) {
        this.id = id;
        this.user = user;
        this.duration = duration;
        this.date = date;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
